const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const propostaCollaborazioneSchema = new Schema({
  titolo: {
    type: String
  },
  fornitore: {
    type: String,
  },
  descrizione: {
    type: String,
  },
  dataCreazione: {
    type: String,
  },
  visibile: {
    type: Boolean
  }
});

module.exports = mongoose.model('propostaCollaborazione', propostaCollaborazioneSchema);