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


let parseSring = async (str) => {
  return new Promise((resolve, reject) => {
    cabocha.parse(str, (result) => {
      let arr = result.depRels.map(ele => ele[1]);
      resolve(arr);
    })
  })
}

let convertKana = async (str) => {
  const res = await kuroshiro.convert(str, { to: "katakana" });
  return res;
}

let convertVerbToBase = async(str) => {
  return new Promise((resolve, reject) => {
    cabocha.parse(str, (result) => {
      let arr = result.words.map(ele => ele[1] === '動詞' ? ele[7] : ele[0]);
      resolve(String(arr.join('')));
    })
  })
}

//Example: てくださる => the cua dong tu

(async () => {
  const base = await convertVerbToBase("今週末、どこかに行きませんか。");

  console.log(mecab.parseSync('今週末、どこかに行きませんか。').map(w => w[8]));
  console.log(typeof (base));

  // console.log(await parseSring("1ヵ月に１回フランス語の作文を書かされました。"));
  // console.log(await parseSring("50歳になって、海外に転勤させられるとは思ってもみなかった"))
  // console.log(await parseSring("V使役受身"))
})();
exports.grammar_check = async (req, res) => {
  const arr = new Set();
  const response = [];
  const base = await convertVerbToBase(req.body.data)
  const inputKana = await convertKana(base);
  // console.log(inputKana)
  const inputWordSet = mecab.wakachiSync(base, (err, result) => {
    if (err) throw err;
    // console.log(result);
  });
  console.log(inputWordSet);
  const inputWordSetToString = inputWordSet.join(' ');
  const inputWordSetToStringToKana = await convertKana(inputWordSetToString);
  const inputWordSetKana = inputWordSetToStringToKana.split(' ');
  // const inputWordSetKana = inputWordSet.map(word, async (word)=> { await convertKana(word) });
  console.log(inputWordSetKana);
  inputWordSetKana.push('...');
  inputWordSetKana.push('～');
  // console.log(inputKana)
  let grammars = await grammar.find();
  // console.log(grammars);
  grammars.map(grammar => {
    let titleFix = grammar.titleKana;
    if (titleFix.includes('～') || grammar.titleKana.includes('...')) {
      titleFix = titleFix.replace('～', '');
      titleFix = titleFix.replace('...', '\\W+');
    }
    let pattern = new RegExp(titleFix);
    // console.log(titleFix);
    if (inputKana.match(pattern)) {
      // let grammarTitleWordSetKana = mecab.wakachiSync(grammar.title, function (err, result) {
      //   if (err) throw err;
      // });
      let grammarTitleWordSetKana = mecab.parseSync(grammar.title).map(word => word[8]);
      // console.log(inputWordSet);
      console.log("*****",grammarTitleWordSetKana);
      let intersection = _.intersection(grammarTitleWordSetKana, inputWordSetKana);
      //So sanh WordSet
      if (_.isEqual(intersection, grammarTitleWordSetKana)) {
        arr.add(grammar.title);
      }
    }
  })
  Array.from(arr).map(ele => {
    let eleText = ele.replace('...', '').replace('～', '');
    let count = 0;
    Array.from(arr).forEach(ele => {
      if (ele.includes(eleText)) {
        count++;
      }
    });
    if (count == 1) {
      response.push({ title: ele })
    }
  });
  // console.log(response);
  res.send(response);
};
exports.get_grammar = async (req, res) => {
  let queryString = req.query;
  let grammars = await grammar.find({ title: queryString.title });
  res.send(grammars);
};
