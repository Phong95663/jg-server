const mongoose = require('mongoose');

let favoriteSchema = new mongoose.Schema({
  _id: String,
  user: String,
  grammar: String,
})

let Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
