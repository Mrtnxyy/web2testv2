const mongoose = require('mongoose');

const repertoarSchema = new mongoose.Schema({
    enekesid: { type: Number, required: true }, 
    szerepid: { type: Number, required: true },
    utoljara: { type: Number },
});

repertoarSchema.index({ enekesid: 1, szerepid: 1 }, { unique: true });

module.exports = mongoose.model('Repertoar', repertoarSchema, 'repertoar');
