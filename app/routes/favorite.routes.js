module.exports = (app) => {
  const favorite = require('../controllers/favorite.controller.js');

  app.post('/api/v1/favorite', favorite.create);

  app.delete('/api/v1/favorite/:favoriteId', favorite.delete);

  app.get('api/v1/get_favorite_list', favorite.get_favorite_list)
}