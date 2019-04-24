const express = require('express');
const bodyParser = require('body-parser');

const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
// Enable CORS for pre-flight request
app.options('*', cors({ origin: true }));
// Enable CORS, security, compression, favicon and body parsing
app.use(cors({ origin: true }));
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(dbConfig.url, {
  useNewUrlParser: true
}).then(() => {
  console.log("Successfully connected to the database");
}).catch(err => {
  console.log('Could not connect to the database. Exiting now...', err);
  process.exit();
});

// app.get('/api/v1/grammar_check', (req, res) => {

//   res.json({ "message": "Welcome to EasyNotes application. Take notes quickly. Organize and keep track of all your notes." });
// });
require('./app/routes/grammar.routes.js')(app);
require('./app/routes/favorite.routes.js')(app);

app.listen(8080, () => {
    console.log("Server is listening on port 80");
});
