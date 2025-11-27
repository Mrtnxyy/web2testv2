const express = require('express');
const router = express.Router();
const Enekes = require('../models/Enekes');

// --- LISTÁZÁS (EZT MOST MINDENKI LÁTHATJA - Nincs Admin ellenőrzés) ---
router.get('/', async (req, res) => {
    try {
        // Énekesek lekérése ABC sorrendben
        const enekesek = await Enekes.find().sort({ nev: 1 });
        
        // Flash üzenetek kezelése
        const messages = req.query.msg ? [req.query.msg] : [];
        
        // Átadjuk a user-t, hogy a nézet (EJS) tudja, kell-e gombokat mutatni
        res.render('crud/enekes_list', { 
            enekesek, 
            messages, 
            user: req.session.user || null 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Hiba történt az adatok betöltésekor');
    }
});

// --- ÚJ FORM MEGJELENÍTÉSE (CSAK ADMIN) ---
router.get('/add', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/crud');
    }
    res.render('crud/enekes_form', { enekes: {}, error: null });
});

// --- ÚJ ÉNEKES MENTÉSE (CSAK ADMIN + AUTO ID) ---
router.post('/add', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/crud');
    }

    try {
        const { nev, szulev } = req.body;

        // Automatikus ID generálás
        const lastEnekes = await Enekes.findOne().sort({ id: -1 });
        const newId = lastEnekes && lastEnekes.id ? lastEnekes.id + 1 : 1;

        await Enekes.create({
            id: newId,
            nev,
            szulev
        });

        res.redirect('/crud?msg=Sikeres hozzáadás!');
    } catch (err) {
        console.error(err);
        res.render('crud/enekes_form', { 
            enekes: { nev: req.body.nev, szulev: req.body.szulev }, 
            error: 'Adatbázis hiba: ' + err.message 
        });
    }
});

// --- SZERKESZTÉS FORM (CSAK ADMIN) ---
router.get('/edit/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/crud');
    }

    try {
        // MongoDB _id alapján keresünk
        const enekes = await Enekes.findById(req.params.id);
        res.render('crud/enekes_form', { enekes, error: null });
    } catch (err) {
        console.error(err);
        res.redirect('/crud');
    }
});

// --- SZERKESZTÉS MENTÉSE (CSAK ADMIN) ---
router.post('/edit/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/crud');
    }

    try {
        const { nev, szulev } = req.body;
        await Enekes.findByIdAndUpdate(req.params.id, { nev, szulev });
        res.redirect('/crud?msg=Sikeres módosítás!');
    } catch (err) {
        console.error(err);
        const enekes = { _id: req.params.id, nev: req.body.nev, szulev: req.body.szulev };
        res.render('crud/enekes_form', { enekes, error: 'Hiba a mentéskor' });
    }
});

// --- TÖRLÉS (CSAK ADMIN) ---
router.post('/delete/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/crud');
    }

    try {
        await Enekes.findByIdAndDelete(req.params.id);
        res.redirect('/crud?msg=Sikeres törlés!');
    } catch (err) {
        console.error(err);
        res.redirect('/crud');
    }
});

module.exports = router;