const mongoose = require('mongoose');

const enekesSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    nev: { type: String, required: true },
    szulev: Number
});

module.exports = mongoose.model('Enekes', enekesSchema);