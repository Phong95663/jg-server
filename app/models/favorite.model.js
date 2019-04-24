const mongoose = require('mongoose');

let favoriteSchema = new mongoose.Schema({
  user: String,
  grammar: String
})

let Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
