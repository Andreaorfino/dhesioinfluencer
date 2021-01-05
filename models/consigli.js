const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const consigliSchema = new Schema({
  data: {
    type: String
  },
  titolo: {
    type: String,
  },
  testo: {
    type: String,
  },
  pubblicato: {
      type: String,
  }
});

module.exports = mongoose.model('consigli', consigliSchema);