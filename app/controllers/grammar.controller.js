const grammar = require('../models/grammar.model.js');
const convert = require('../utils/convertKana');
const Kuroshiro = require('kuroshiro');
const analyzer = require('kuroshiro-analyzer-kuromoji');
const MeCab = require('mecab-async');
const _ = require('lodash');
const Cabocha = require('node-cabocha');
const mecab = new MeCab();
const kuroshiro = new Kuroshiro();
const cabocha = new Cabocha();
kuroshiro.init(new analyzer());

const parseSring = async (str) => {
  return new Promise((resolve, reject) => {
    cabocha.parse(str, (result) => {
      let arr = result.depRels.map(ele => ele[1]);
      resolve(arr);
    })
  })
}

const convertKana = async (str) => {
  const res = await kuroshiro.convert(str, { to: "katakana" });
  return res;
}

const convertVerbToBase = async (str) => {
  return new Promise((resolve, reject) => {
    cabocha.parse(str, (result) => {
      let arr = result.words.map(ele => ele[1] === '動詞' ? ele[7] : ele[0]);
      resolve(String(arr.join('')));
    })
  })
}

const getUnique = (arr, comp) => {

  const unique = arr
    .map(e => e[comp])

    // store the keys of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)

    // eliminate the dead keys & store unique objects
    .filter(e => arr[e]).map(e => arr[e]);

  return unique;
}

(async () => {
  // const base = await convertVerbToBase("今週末、どこかに行きませんか。");
  // const base = await convertVerbToBase("部長はこの時計を買って下さいました");
  // console.log("=======", base);
  // console.log(mecab.parseSync('部長はこの時計を買って下さいました').map(w => w[8]));
  // console.log(typeof (base));

  // console.log(await parseSring("1ヵ月に１回フランス語の作文を書かされました。"));
  console.log(await parseSring("50歳になって、海外に転勤させられるとは思ってもみなかった"))
  // console.log(await parseSring("V使役受身"))
})();

exports.grammar_check = async (req, res) => {
  const arr = new Set();
  const response = [];
  console.log("-----------", req.body.data)
  const base = await convertVerbToBase(req.body.data.replace(/(\r\n|\n|\r)/gm, ""));
  const inputKana = await convertKana(base);
  // const inputWordSet = mecab.wakachiSync(req.body.data, (err, result) => {
  //   if (err) throw err;
  //   // console.log(result);
  // });
  // inputWordSet.push('...');
  // inputWordSet.push('～');
  // console.log(inputKana)
  let grammars = await grammar.find({}, {_id: 1, title: 1, titleKana:1});
  // console.log(grammars);
  grammars.map(async grammar => {
    // const titleBase = await convertVerbToBase(grammar.title);
    // const titleFix = await convertKana(titleBase);
    // console.log("----------", titleFix);
    let titleFix = grammar.titleKana;
    if (titleFix.includes('～') || grammar.titleKana.includes('...')) {
      titleFix = titleFix.replace('～', '');
      titleFix = titleFix.replace('...', '\\W+');
    }

    let pattern = new RegExp(titleFix);
    // console.log(titleFix);
    // console.log("----------", inputKana);
    // console.log("==========", titleFix);
    if (inputKana.match(pattern)) {
      // console.log("========", grammar)
      // console.log('********grammar1', grammar.title)
      // let grammarTitleWordSet = mecab.wakachiSync(grammar.title, function (err, result) {
      //   if (err) throw err;
      // });
      // console.log(inputWordSet);
      // console.log("*****",grammarTitleWordSet);
      // let intersection = _.intersection(grammarTitleWordSet, inputWordSet);
      //So sanh WordSet
      // if (_.isEqual(intersection, grammarTitleWordSet)) {
      //   console.log('******grammar2', grammar.title)
        arr.add(grammar);
        // console.log(arr)
      // }
    }
  })
  // Array.from(arr).map(ele => {
  //   let eleText = ele.replace('...', '').replace('～', '');
  //   let count = 0;
  //   Array.from(arr).forEach(ele => {
  //     if (ele.includes(eleText)) {
  //       count++;
  //     }
  //   });
  //   if (count == 1) {
  //     // let startIndex;
  //     // let endIndex;

  //     response.push({ title: ele })
  //   }
  // });

  // console.log(response);
  Array.from(arr).map(ele => {
    let count = 0;
    const title1 = ele.title;
    if (title1.replace('～', '').replace('...', '').length > 1) {
      Array.from(arr).forEach(elem => {
        let title = elem.title;
        if (title.includes(title1)) {
          count++;
        }
      });
      if (count >= 1) {
        response.push({ id: ele._id, title: ele.title })
      }
    }
  })

  // console.log(getUnique(response, 'title'));
  res.send(getUnique(response, 'title'));
};
exports.get_grammar = async (req, res) => {
  let data = req.body.data;
  let grammars = await grammar.find({title: data});
  res.send(grammars);
};

exports.findOne = async (req, res) => {
  let data = req.params.id;
  let response = await grammar.find({ _id: data });
  res.send(response);
}
