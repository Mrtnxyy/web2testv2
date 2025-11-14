// models/szerep.js
const mongoose = require('mongoose');

const szerepSchema = new mongoose.Schema({
    originalId: { type: Number, required: true, unique: true },
    szerepnev: { type: String, required: true },
    muid: { type: Number, required: true }, 
    hang: { type: String }
});

module.exports = mongoose.model('Szerep', szerepSchema, 'szerepek');