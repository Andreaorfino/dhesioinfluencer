const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const userSchema = new Schema({
  nickname: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  niscrizione: Number,
  profilePic: String,
  resetToken: String,
  resetTokenExpiration: Date,
  chance: {
    type: Number,
    required: true
  },
  sesso: String,
  notificaSconti: Number,
  eta: String,
  interessi: String,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        }
      }
    ]
  },
  bought: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        }
      }
    ]
  }
});

userSchema.methods.addToCart = function (product) {

  const updatedCartItems = [...this.cart.items];
  
  updatedCartItems.push({
    productId: product._id,
  });
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();
};


userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

//preferiti

userSchema.methods.addToBought = function (product) {

  const updatedBoughtItems = [...this.bought.items];
  
  updatedBoughtItems.push({
    productId: product._id,
  });
  const updatedBought = {
    items: updatedBoughtItems
  };
  this.bought = updatedBought;
  return this.save();
};


userSchema.methods.removeFromBought = function (productId) {
  const updatedBoughtItems = this.bought.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  this.bought.items = updatedBoughtItems;
  return this.save();
};

userSchema.methods.clearBought = function () {
  this.bought = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
