const express = require('express');
const router = express.Router();
const db = require('../config/db');
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login');
  next();
}
router.get('/', requireLogin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, message, created_at FROM messages ORDER BY created_at DESC');
    res.render('messages', { messages: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Hiba a lekérés során');
  }
});
module.exports = router;
