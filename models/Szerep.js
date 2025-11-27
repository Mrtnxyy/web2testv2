const mongoose = require('mongoose');

const szerepSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    szerepnev: String,
    muid: Number,
    hang: String
});

module.exports = mongoose.model('Szerep', szerepSchema);