const Favorite = require('../models/favorite.model');

exports.create = async (req, res) => {
  // Validate request
  console.log(req.body)
  if (!req.body.user) {
    return res.status(400).send({
      message: "Err"
    });
  }

  const favorite = new Favorite({
    user: req.body.user,
    grammar: req.body.grammar
  });

  favorite.save()
    .then(data => {
      res.send(data);
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Favorite."
      });
    });
}

exports.delete = async (req, res) => {
  console.log("bbbbbbbbb", req.params.favoriteId)
  Favorite.findByIdAndRemove(req.params.favoriteId)
    .then(favorite => {
      if (!favorite) {
        return res.status(404).send({
          message: "Favorite not found with id " + req.params.favoriteId
        });
      }
      res.send({ message: "Favorite deleted successfully!" });
    }).catch(err => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: "Favorite not found with id " + req.params.favoriteId
        });
      }
      return res.status(500).send({
        message: "Could not delete favorite with id " + req.params.favoriteId
      });
    });
}

exports.get_favorite_list = async () => {

}
