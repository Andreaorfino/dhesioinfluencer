const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const logsSchema = new Schema({
    tipo: {
        type: String
    },
    data: {
        type: String
    },
    params: {}
});

module.exports = mongoose.model('log', logsSchema);