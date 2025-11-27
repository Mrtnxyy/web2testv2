const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reply: { type: String, default: null },
    replied_at: { type: Date, default: null },
    read: { type: Boolean, default: false }
});

module.exports = mongoose.model('Message', messageSchema, 'messages');