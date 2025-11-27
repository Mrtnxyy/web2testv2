const mongoose = require('mongoose');

const repertoarSchema = new mongoose.Schema({
    enekesid: Number,
    szerepid: Number,
    utoljara: Number
});

module.exports = mongoose.model('Repertoar', repertoarSchema);