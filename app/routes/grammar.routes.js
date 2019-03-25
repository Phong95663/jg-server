module.exports = (app) => {
  const grammar = require('../controllers/grammar.controller.js');

  app.post('/grammar_check', grammar.grammar_check);

  app.get('/get_grammar/:id', grammar.get_grammar);
}
