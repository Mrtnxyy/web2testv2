const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login');
  next();
}

router.get('/', requireLogin, async (req, res) => {
  try {
    const messages = await Message.find()
        .select('name email message created_at')
        .sort({ created_at: -1 })
        .lean(); 
        
    res.render('messages', { messages: messages });
  } catch (err) {
    console.error('Hiba az üzenetek lekérésekor (MongoDB):', err);
    res.status(500).send('Hiba az üzenetek lekérés során');
  }
});

module.exports = router;