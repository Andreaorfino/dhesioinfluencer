const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventoSchema = new Schema({
  inizio: {
    type: String,
    required: true
  },
  fine: {
    type: String,
    required: true
  },
  numeroLotterie: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('periodo', eventoSchema);