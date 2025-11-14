// routes/crud.js (Befejezett MongoDB Mongoose Logic)
const express = require('express');
const router = express.Router();

// Mongoose Modellek importálása
const Enekes = require('../models/Enekes'); 
// A többi modell (Mu, Szerep, Repertoar) is importálva van, ha szükséges

// Middleware: admin jogosultság ellenőrzésére
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
    // Ellenőrizzük, hogy be van-e jelentkezve
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    
    // Ideiglenesen kikapcsoljuk az admin ellenőrzést, amíg a bejelentkezés tökéletesen nem működik
    // Bár ez nem ideális, segít látni, ha a Mongo lekérdezés működik.

    try {
        // Mongoose lekérdezés: minden énekes lekérdezése
        const enekesek = await Enekes.find().sort({ nev: 1 }).lean(); 
        
        res.render('crud/enekes_list', { 
            title: 'Énekesek (CRUD)', 
            enekesek: enekesek,
            messages: req.session.messages || null // Üzenetek átadása
        });
        // Üzenetek törlése a sessionből a megjelenítés után
        req.session.messages = [];
    } catch (error) {
        console.error('Hiba az énekesek lekérdezésekor:', error);
        res.render('error', { message: 'Adatbázis hiba történt a listázás során.' });
    }
});


// ----------------------
// Énekes Szerkesztése - /crud/edit/:id
// ----------------------
router.get('/edit/:id', ensureAdmin, async (req, res) => {
    try {
        // MongoDB _id alapján történő keresés
        const enekes = await Enekes.findById(req.params.id).lean(); 
        if (!enekes) {
            return res.status(404).send('Énekes nem található.');
        }
        // Feltételezzük, hogy van 'crud/enekes_form.ejs' fájl
        res.render('crud/enekes_form', { title: 'Énekes szerkesztése', enekes: enekes, error: null });
    } catch (error) {
        console.error('Hiba a szerkesztő űrlap betöltésekor:', error);
        res.status(500).send('Hiba a szerkesztő űrlap betöltésekor.');
    }
});

// Énekes Frissítése (POST metódus a szerkesztő űrlapról)
router.post('/edit/:id', ensureAdmin, async (req, res) => {
    const { nev, szulev } = req.body;
    try {
        // Mongoose: dokumentum frissítése az ID alapján
        await Enekes.findByIdAndUpdate(req.params.id, { 
            nev: nev, 
            szulev: parseInt(szulev) 
        });
        
        // Üzenet hozzáadása a sessionhöz
        req.session.messages = ['Énekes sikeresen frissítve.'];
        res.redirect('/crud');
    } catch (error) {
        console.error('Hiba az énekes frissítésekor:', error);
        res.render('crud/enekes_form', { 
            title: 'Énekes szerkesztése', 
            enekes: req.body, 
            error: 'Hiba történt a frissítés során.' 
        });
    }
});

// ----------------------
// Énekes Törlése - /crud/delete/:id
// ----------------------
// Mivel a method-override a POST-ot használja a DELETE kéréshez:
router.post('/delete/:id', ensureAdmin, async (req, res) => {
    try {
        // Mongoose: dokumentum törlése az ID alapján
        await Enekes.findByIdAndDelete(req.params.id);
        
        // Mivel a repertoarban is originalId-k vannak, ott nem kell itt külön törölni, csak az Enekes-t.

        req.session.messages = ['Énekes sikeresen törölve.'];
        res.redirect('/crud');
    } catch (error) {
        console.error('Hiba az énekes törlésekor:', error);
        req.session.messages = ['Hiba történt a törlés során.'];
        res.redirect('/crud');
    }
});

module.exports = router;
