const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const collaborazioneSchema = new Schema({
  titolo: {
    type: String,
    required: true
  },
  cosaFatto: {
    type: String,
    required: true
  },
  recensione: {
    type: String,
    required: true
  },
  stelle: {
    type: String,
    required: true
  },
  social: {
    type: String
  },
  autore: {
    type: Schema.Types.ObjectId,
    ref: 'influencer',
    required: true
  },
  data: {
    type: String,
    required: true
  },
  creazioneData: {
    type: String,
    required: true
  },
  nLike:{ 
    type: Number
  },
  nonVisibile:{
    type: Boolean
  },
  fornitore: {
    type: Schema.Types.ObjectId,
    ref: 'fornitori',
    required: true
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'influencer',
      required: true
    }

  ],
  nonmipiace: [
    {
      influencerId: {
        type: Schema.Types.ObjectId,
        ref: 'Influencer',
        required: true
      }
    }
  ],
  commenti: [
    {
      influencerId: {
        type: Schema.Types.ObjectId,
        ref: 'influencer',
        required: true
      },
      testo: {
        type: String,
        required: true
      }
    }
  ],
});


module.exports = mongoose.model('collaborazione', collaborazioneSchema);
