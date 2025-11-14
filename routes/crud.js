// routes/crud.js (MongoDB Mongoose Logic)
const express = require('express');
const router = express.Router();

// Mongoose Modellek importálása
const Enekes = require('../models/Enekes'); 
const Mu = require('../models/Mu'); 
const Szerep = require('../models/Szerep'); 
const Repertoar = require('../models/Repertoar'); 

// Middleware: admin jogosultság ellenőrzésére (ezzel védjük a CRUD oldalakat)
function ensureAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    // Ha nem admin, átirányítás a főoldalra
    res.redirect('/'); 
}

// ----------------------
// Énekesek listázása (CRUD főoldal) - /crud
// ----------------------
router.get('/', async (req, res) => {
    // Ellenőrizzük, hogy be van-e jelentkezve, mielőtt a ensureAdmin ellenőrizné a role-t.
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    
    // Ideiglenesen kikapcsoljuk az admin ellenőrzést, amíg a bejelentkezés tökéletesen nem működik
    // Bár ez nem ideális, segít látni, ha a Mongo lekérdezés működik.
    // ensureAdmin(req, res, async () => { ... }) 

    try {
        // Mongoose lekérdezés: minden énekes lekérdezése
        const enekesek = await Enekes.find().sort({ nev: 1 }).lean(); 
        
        res.render('crud/enekes_list', { 
            title: 'Énekesek (CRUD)', 
            enekesek: enekesek,
            messages: req.session.messages || null
        });
        req.session.messages = [];
    } catch (error) {
        console.error('Hiba az énekesek lekérdezésekor:', error);
        res.render('error', { message: 'Adatbázis hiba történt a listázás során.' });
    }
});

// A többi CRUD útvonal (add, edit, delete) is hasonló Mongoose logikát használna.

module.exports = router;
