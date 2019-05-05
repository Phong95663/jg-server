module.exports = (app) => {
  const grammar = require('../controllers/grammar.controller.js');

  app.post('/api/v1/grammar_check', grammar.grammar_check);

  app.post('/api/v1/get_grammar', grammar.get_grammar);

  app.get('/api/v1/grammar/:id', grammar.findOne)
}
