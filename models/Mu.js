// models/mu.js
const mongoose = require('mongoose');

const muSchema = new mongoose.Schema({
    originalId: { type: Number, required: true, unique: true },
    szerzo: { type: String, required: true },
    cim: { type: String, required: true }
});

module.exports = mongoose.model('Mu', muSchema, 'muvek');