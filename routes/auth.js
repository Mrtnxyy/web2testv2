const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.get('/register', (req, res) => {
  res.render('auth/register', { error: null });
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email: email }); 
    
    if (existingUser) {
      return res.render('auth/register', { error: 'Ezzel az emaillel már regisztráltak.' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const role = 'user';

    await User.create({
      name: name,
      email: email,
      password: hash,
      role: role
    });
    
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Regisztrációs hiba:', err);
    res.render('auth/register', { error: 'Regisztrációs hiba.' });
  }
});

router.get('/login', (req, res) => {
  res.render('auth/login', { error: null });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.render('auth/login', { error: 'Helytelen adatok.' });
    }
    
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      return res.render('auth/login', { error: 'Helytelen adatok.' });
    }

    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    res.redirect('/');
  } catch (err) {
    console.error('Bejelentkezési hiba:', err);
    res.render('auth/login', { error: 'Bejelentkezési hiba.' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;