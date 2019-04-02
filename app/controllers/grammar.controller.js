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
exports.grammar_check = async (req, res) => {
  const arr = new Set();
  const response = [];
  const inputKana = await convertKana(req.body.data);
  const inputWordSet = mecab.wakachiSync(req.body.data, (err, result) => {
    if (err) throw err;
    // console.log(result);
  });
  inputWordSet.push('...');
  inputWordSet.push('～');
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
      let grammarTitleWordSet = mecab.wakachiSync(grammar.title, function (err, result) {
        if (err) throw err;
      });
      console.log(inputWordSet);
      console.log("*****",grammarTitleWordSet);
      let intersection = _.intersection(grammarTitleWordSet, inputWordSet);
      //So sanh WordSet
      if (_.isEqual(intersection, grammarTitleWordSet)) {
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
  console.log(response);
  res.send(response);
};
exports.get_grammar = async (req, res) => {
  let queryString = req.query;
  let grammars = await grammar.find({ title: queryString.title });
  res.send(grammars);
};
