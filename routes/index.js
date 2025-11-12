const express = require('express');
const router = express.Router();
const db = require('../config/db');
router.get('/', async (req, res) => {
  res.render('index');
});
router.get('/adatbazis', async (req, res) => {
  try {
    const [enekes] = await db.query('SELECT * FROM enekes LIMIT 200');
    const [mu] = await db.query('SELECT * FROM mu LIMIT 200');
    const [szerep] = await db.query('SELECT * FROM szerep LIMIT 200');
    res.render('adatbazis', { enekes, mu, szerep });
  } catch (err) {
    console.error(err);
    res.status(500).send('Hiba az adatbázisból való lekéréskor');
  }
});
router.get('/contact', (req, res) => {
  res.render('contact');
});
router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await db.query('INSERT INTO messages (name, email, message, created_at) VALUES (?, ?, ?, NOW())',
      [name, email, message]);
    res.render('contact', { success: 'Üzenet elküldve. Köszönjük!' });
  } catch (err) {
    console.error(err);
    res.render('contact', { error: 'Sikertelen küldés.' });
  }
});
module.exports = router;
