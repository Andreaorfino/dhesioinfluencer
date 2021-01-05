const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const listaAttesaSchema = new Schema({
  nome: {
    type: String
  },
  nomeAzienda: {
    type: String,
  },
  email: {
    type: String,
  },
  nonMandare: {
    type: Boolean,
  },
  nmail: {
    type: Number,
  }
});

module.exports = mongoose.model('listaAttesa', listaAttesaSchema);