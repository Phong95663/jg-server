const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/jg-data', { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
  console.log(`mongodb connected!`);
  const grammaSchema = ({
    mean: String,
    examples: Array,
    explain: String,
    title: String,
    titleKana: String,
    use: String
  });
  const GrammaModel = mongoose.model('grammars', grammaSchema);

  GrammaModel.find({}, (err, allGramma) => {
    console.log("allGramma", allGramma);
    const len = allGramma.length;
    for (let i = 0; i < len; i++) {
      const gramma = allGramma[i];
      // gramma.title = gramma.title.replace(/\(.*\)/, '');
      if (gramma.title.charAt(0) == '～' || gramma.title.charAt(0) == '.') {
        gramma.title = gramma.title.substr(3);
        gramma.titleKana = gramma.titleKana.substr(1);
      }
      gramma.save();
    }
  });
});
