const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const smallProductSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }
/*   dealer: { 
    type: String,
    required: true
  } */

});

module.exports = mongoose.model('smallProduct', smallProductSchema);
