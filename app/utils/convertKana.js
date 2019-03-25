const Kuroshiro = require('kuroshiro');
const analyzer = require('kuroshiro-analyzer-kuromoji');
const kuroshiro = new Kuroshiro();
kuroshiro.init(new analyzer());

let convertKana = async (str) => {
  const res = await kuroshiro.convert(str, { to: "katakana" });
  return res;
}

module.exports.convertKana = convertKana;
