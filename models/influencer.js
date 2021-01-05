const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const influencerSchema = new Schema({
    nicknameAccesso: {
        type: String,
        required: true
    },
    nicknameTikTok: {
        type: String,
        required: true
    },
    nicknameInstagram: {
        type: String,
        required: true
    },
    like: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    niscrizione: Number,
    urlImage: {
        type: String,
        required: true
    },
    marginLeft: {
        type: String
    },
    marginTop: {
        type: String
    },
    nome: {
        type: String,
        required: true
    },
    sesso: {
        type: String,
        required: true
    },
    eta: {
        type: String,
        required: true
    },
    etaFollowers1: {
        type: String
    },
    etaFollowers2: {
        type: String
    },
    sessoFollowers: {
        type: String,
        required: true
    },
    interessiFollowers1: {
        type: String
    },
    interessiFollowers2: {
        type: String
    },
    numeroFollowersTiktok: {
        type: String
    },
    punteggio: {
        type: Number,
        required: true
    },
    verificato: {
        type: Boolean
    },
    numeroFollowersInstagram: {
        type: String
    },
    descrizione: {
        type: String
    },
    eliminato: {
        type: Boolean
    },
    email: {
        type: String,
        required: true
    },
    landscape: {
        type: String
    },
    nLike: {
        type: Number
    },
    admin: {
        type: Boolean
    },
    resetToken: String,
    resetTokenExpiration: Date,
    collaborazioni: [
        {
            type: Schema.Types.ObjectId,
            ref: 'collaborazione',
            required: true
        }

    ],
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'collaborazione',
            required: true
        }

    ],
});


module.exports = mongoose.model('influencer', influencerSchema);
