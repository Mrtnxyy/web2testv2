const mongoose = require('mongoose');

const enekesSchema = new mongoose.Schema({
    originalId: { type: Number, required: true, unique: true },
    nev: { type: String, required: true },
    szulev: { type: Number },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Enekes', enekesSchema, 'enekesek');
