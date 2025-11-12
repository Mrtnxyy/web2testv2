const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');
router.get('/register', (req, res) => {
  res.render('register');
});
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length) return res.render('register', { error: 'Ezzel az emaillel már regisztráltak.' });
    const hash = await bcrypt.hash(password, 10);
    const role = 'user';
    await db.query('INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, email, hash, role]);
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Regisztrációs hiba.' });
  }
});
router.get('/login', (req, res) => {
  res.render('login');
});
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.render('login', { error: 'Helytelen adatok.' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.render('login', { error: 'Helytelen adatok.' });
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Bejelentkezési hiba.' });
  }
});
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});
module.exports = router;
