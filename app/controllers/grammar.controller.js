const grammar = require('../models/grammar.model.js');
const convert = require('../utils/convertKana');
const Kuroshiro = require('kuroshiro');
const analyzer = require('kuroshiro-analyzer-kuromoji');
const MeCab = require('mecab-async');
const _ = require('lodash');
const mecab = new MeCab();
const kuroshiro = new Kuroshiro();
kuroshiro.init(new analyzer());

// mecab.parser = data => {
//   kanji: data[0],
//   lexical: data[1],
//   compound: data[2],
//   compound2     : data[3],
//   compound3     : data[4],
//   conjugation   : data[5],
//   inflection    : data[6],
//   original      : data[7],
//   reading       : data[8],
//   pronunciation : data[9] || ''
// };
// mecab.wakachi('あのレストランは安いし、うまい。', function (err, result) {
//   if (err) throw err;
//   console.log(result);
// });

let convertKana = async (str) => {
  const res = await kuroshiro.convert(str, { to: "katakana" });
  return res;
}
// let a = _.intersection(['の', 'は', '...', 'ため', 'だ'], ['彼', 'の', '一見', '痴鈍', 'らしい', 'の', 'は', '長く', '脳病', 'を', '煩っ', 'た', 'ため', 'だ', '...', '～']);
// console.log(_.isEqual(a, ['の', 'は', '...', 'ため', 'だ']));
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
    // console.log(inputWordSet);
    // console.log(grammarTitleWordSet);
    // console.log('*****', _.intersection(grammarTitleWordSet, inputWordSet) == grammarTitleWordSet)
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
      if (_.isEqual(intersection, grammarTitleWordSet)) {
        arr.add(grammar.title);
      }
      // console.log(inputKana.match(pattern));
    }
  })
  Array.from(arr).map(ele => {
    response.push({ title: ele})
  });
  // console.log(response);
  res.send(response);
};
exports.get_grammar = (req, res) => {

};
