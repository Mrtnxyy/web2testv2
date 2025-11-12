const express = require('express');
const router = express.Router();
const db = require('../config/db');
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Nincs jogosultság');
  next();
}
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM enekes ORDER BY id DESC');
  res.render('crud/list', { items: rows });
});
router.get('/new', requireAdmin, (req, res) => {
  res.render('crud/form', { item: null });
});
router.post('/new', requireAdmin, async (req, res) => {
  const { name, szulev } = req.body;
  await db.query('INSERT INTO enekes (nev, szulev) VALUES (?, ?)', [name, szulev]);
  res.redirect('/crud');
});
router.get('/:id', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM enekes WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).send('Nincs ilyen.');
  res.render('crud/view', { item: rows[0] });
});
router.get('/:id/edit', requireAdmin, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM enekes WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).send('Nincs ilyen.');
  res.render('crud/form', { item: rows[0] });
});
router.put('/:id', requireAdmin, async (req, res) => {
  const { name, szulev } = req.body;
  await db.query('UPDATE enekes SET nev=?, szulev=? WHERE id=?', [name, szulev, req.params.id]);
  res.redirect('/crud');
});
router.delete('/:id', requireAdmin, async (req, res) => {
  await db.query('DELETE FROM enekes WHERE id = ?', [req.params.id]);
  res.redirect('/crud');
});
module.exports = router;
