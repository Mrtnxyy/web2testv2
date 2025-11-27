const mongoose = require('mongoose');

const muSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    szerzo: String,
    cim: String
});

module.exports = mongoose.model('Mu', muSchema);