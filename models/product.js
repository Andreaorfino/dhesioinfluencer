const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  valore: {
    type: String,
    required: true
  },
  influencer: {
    type: String,
    required: true
  },
  evento: {
    type: String,
    required: true
  },
  visibile: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  imageProduttore: {
    type: String,
    required: true
  }, 
  hasCoccarda:{
    type: String,
    required: true
  },
  instagramid: {
    type: String,
    required: true
  },
  difficolta: {
    type: Number,
    required: true
  },
  timeout: {
    type: String,
    required: true
  },
  timeoutUtenti: {
    type: String,
    required: true
  },
  totaleOre: {
    type: Number,
    required: true
  },
  vincitore: {
    type: String,
    required: true
  },
  fornitore: { 
    type: String,
    required: true
  }, 
  via: { 
    type: String,
    required: true
  }, 
  zona: { 
    type: String,
    required: true
  }, 
  sito: { 
    type: String,
    required: true
  }, 
  frase1: { 
    type: String,
    required: true
  }, 
  tipoLotteria: { 
    type: String,
    required: true
  },
  nome: { 
    type: String,
    required: true
  },
  sottotitolo: { 
    type: String,
    required: true
  },
  prodottoFisico: { 
    type: String,
    required: true
  },
  descrizionesopra: { 
    type: String,
    required: true
  },
  descrizionesopra2: { 
    type: String,
    required: true
  },
  descrizionesotto: { 
    type: String,
    required: true
  },
  sesso: { 
    type: String,
    required: true
  },  
  nomeBuono: { 
    type: String
  },
  valoreBuono: { 
    type: String
  },
  scadenzaBuono: { 
    type: String
  },
  fraseimg1: { 
    type: String,
    required: true
  },   
  periodo: {
    type: Schema.Types.ObjectId,
    ref: 'periodo',
    required: true
  },
  vincite: {
    items: [
      {
        elem: {
          type: String,
          required: true
        }
      }
    ]
  },
  iscritti: {
    items: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        }
      }
    ]
  },
  buoniSconto: {
    items: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        }
      }
    ]
  }


});

productSchema.methods.addToInscritto = function (user) {
/*   const cartProductIndex = this.consolazione.items.findIndex(cp => {
    return cp.productId.toString() === smallProduct._id.toString();
  }); */

  const updatedIscrittiItems = [...this.iscritti.items];
  updatedIscrittiItems.push({
    userId: user._id,
  });

  const updatedIscritti = {
    items: updatedIscrittiItems
  };
  this.iscritti = updatedIscritti;
  return this.save();
};


productSchema.methods.addToBuoniSconto = function (user) {
  /*   const cartProductIndex = this.consolazione.items.findIndex(cp => {
      return cp.productId.toString() === smallProduct._id.toString();
    }); */
  
    const updatedbuoniScontoItems = [...this.buoniSconto.items];
    updatedbuoniScontoItems.push({
      userId: user._id,
    });
  
    const updatedbuoniSconto = {
      items: updatedbuoniScontoItems
    };
    this.buoniSconto = updatedbuoniSconto;
    return this.save();
  };

productSchema.methods.addComment = function (nickname,parole) {
  /*   const cartProductIndex = this.consolazione.items.findIndex(cp => {
      return cp.productId.toString() === smallProduct._id.toString();
    }); */
  
    const updatedCommentItems = [...this.comments.items];
    //console.log(updatedCommentItems);
    updatedCommentItems.push({
      autore: nickname,
      testo: parole
    });
    //console.log(updatedCommentItems);
  
    const updatedComments = {
      items: updatedCommentItems
    };
    //console.log(updatedComments);
    this.comments = updatedComments;
    //console.log(this.comments);
    return this.save();
  };

module.exports = mongoose.model('Product', productSchema);
