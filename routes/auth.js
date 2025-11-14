// routes/auth.js (MongoDB Mongoose Logic)

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User'); // <-- Mongoose User Modell importálása

// Az adatbázis modul (db) hivatkozása törölve a MongoDB miatt.


router.get('/register', (req, res) => {
  // A korábbi EJS hibák elkerülése végett átadunk egy null/üres error objektumot
  res.render('auth/register', { error: null });
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // MongoDB lekérdezés: Ellenőrzés, hogy az email létezik-e (SQL: SELECT id FROM users...)
    const existingUser = await User.findOne({ email: email }); 
    
    if (existingUser) {
      return res.render('auth/register', { error: 'Ezzel az emaillel már regisztráltak.' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const role = 'user';

    // MongoDB beszúrás: Új felhasználó létrehozása (SQL: INSERT INTO users...)
    await User.create({
      name: name,
      email: email,
      password: hash,
      role: role
      // created_at automatikusan beállítódik a modellben
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
    // MongoDB lekérdezés: Felhasználó keresése (SQL: SELECT * FROM users...)
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.render('auth/login', { error: 'Helytelen adatok.' });
    }
    
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      return res.render('auth/login', { error: 'Helytelen adatok.' });
    }
    
    // Mongoose-ban az azonosító az _id mező (user._id)
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
