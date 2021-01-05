const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const fornitoreSchema = new Schema({
  nome: {
    type: String,
    required: true
  },
  zona: {
    type: String,
  },
  via: {
    type: String,
  },
  rating: {
    type: String,
  },
  sito: {
    type: String,
  },
  registrazione:{
    type: Boolean
  },
  username: {
    type: String
  },
  password: {
    type: String
  },
  collaborazioni: [
    {
      type: Schema.Types.ObjectId,
      ref: 'collaborazione',
      required: true
    }
  ],
});

module.exports = mongoose.model('fornitori', fornitoreSchema);