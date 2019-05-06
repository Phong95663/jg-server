const Favorite = require('../models/favorite.model');
const grammar = require('../models/grammar.model.js');

exports.create = async (req, res) => {
  // Validate request
  console.log(req.body)
  if (!req.body.user) {
    return res.status(400).send({
      message: "Err"
    });
  }

  const favorite = new Favorite({
    _id: `${req.body.user}-${req.body.grammar}`,
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

exports.findAll = async (req, res) => {
  console.log("--------", req.params)
  const user = req.params.uid;
  Favorite.find({ user: user })
    .then(favorites => {
      res.send(favorites);
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving favorite"
      });
    });
}
