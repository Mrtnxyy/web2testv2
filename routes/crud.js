const express = require('express');
const router = express.Router();
const Enekes = require('../models/Enekes');

// --- LISTÁZÁS (Főoldal) ---
router.get('/', async (req, res) => {
    try {
        // Énekesek lekérése ABC sorrendben
        const enekesek = await Enekes.find().sort({ nev: 1 });
        
        // Flash üzenetek kezelése (ha van)
        const messages = req.query.msg ? [req.query.msg] : [];
        
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

// --- ÚJ ÉNEKES FORM MEGJELENÍTÉSE ---
router.get('/add', (req, res) => {
    // Csak admin érheti el
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/crud');
    }
    res.render('crud/enekes_form', { enekes: {}, error: null });
});

// --- ÚJ ÉNEKES MENTÉSE (ITT VOLT A HIBA) ---
router.post('/add', async (req, res) => {
    // Csak admin
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/crud');
    }

    try {
        const { nev, szulev } = req.body;

        // 1. Megkeressük a legnagyobb ID-t az adatbázisban
        const lastEnekes = await Enekes.findOne().sort({ id: -1 });
        
        // 2. Ha van, hozzáadunk egyet, ha nincs (üres db), akkor 1 lesz az ID
        const newId = lastEnekes && lastEnekes.id ? lastEnekes.id + 1 : 1;

        // 3. Létrehozás az ÚJ ID-val
        await Enekes.create({
            id: newId,  // EZ HIÁNYZOTT EDDIG!
            nev,
            szulev
        });

        res.redirect('/crud?msg=Sikeres hozzáadás!');
    } catch (err) {
        console.error(err);
        // Ha hiba van, visszaküldjük az űrlapot a hibaüzenettel
        res.render('crud/enekes_form', { 
            enekes: { nev: req.body.nev, szulev: req.body.szulev }, 
            error: 'Adatbázis hiba történt a beszúrás során: ' + err.message 
        });
    }
});

// --- SZERKESZTÉS FORM MEGJELENÍTÉSE ---
router.get('/edit/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/crud');
    }

    try {
        // Fontos: Itt a MongoDB _id-t használjuk a kereséshez (az URL-ből)
        const enekes = await Enekes.findById(req.params.id);
        res.render('crud/enekes_form', { enekes, error: null });
    } catch (err) {
        console.error(err);
        res.redirect('/crud');
    }
});

// --- SZERKESZTÉS MENTÉSE ---
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

// --- TÖRLÉS ---
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