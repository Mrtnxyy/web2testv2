// routes/crud.js (Befejezett MongoDB Mongoose Logic)
const express = require('express');
const router = express.Router();

// Mongoose Modellek importálása (Mindig ellenőrizd a betűméretet!)
const Enekes = require('../models/Enekes'); 
// A többi modult (Mu, Szerep, Repertoar) is importáljuk, ha szükséges
const Mu = require('../models/Mu'); 
const Szerep = require('../models/Szerep'); 
const Repertoar = require('../models/Repertoar'); 

// Middleware: admin jogosultság ellenőrzésére (ha be van kapcsolva a bejelentkezés)
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
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    
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
// ÚJ ÉNEKES HOZZÁADÁSA (CREATE) - /crud/add
// ----------------------
router.get('/add', ensureAdmin, (req, res) => {
    // Üres objektumot adunk át az űrlapnak, jelezve a "Hozzáadás" módot
    res.render('crud/enekes_form', { 
        title: 'Új énekes hozzáadása', 
        enekes: {}, // Üres objektum
        error: null 
    });
});

router.post('/add', ensureAdmin, async (req, res) => {
    const { nev, szulev } = req.body;
    try {
        // A legmagasabb originalId megkeresése és növelése (ez kell a kapcsolatok miatt)
        const lastEnekes = await Enekes.findOne().sort({ originalId: -1 });
        const newOriginalId = (lastEnekes ? lastEnekes.originalId : 0) + 1;

        // Mongoose: dokumentum létrehozása
        await Enekes.create({ 
            originalId: newOriginalId,
            nev: nev, 
            szulev: parseInt(szulev) 
        });
        
        req.session.messages = ['Új énekes sikeresen hozzáadva.'];
        res.redirect('/crud');
    } catch (error) {
        console.error('Hiba az énekes hozzáadásakor:', error);
        // Hiba esetén visszatöltjük az űrlapot a felhasználó által beírt adatokkal
        res.render('crud/enekes_form', { 
            title: 'Új énekes hozzáadása', 
            enekes: req.body, 
            error: 'Adatbázis hiba történt a beszúrás során.' 
        });
    }
});


// ----------------------
// Énekes Szerkesztése (UPDATE) - /crud/edit/:id
// ----------------------
router.get('/edit/:id', ensureAdmin, async (req, res) => {
    try {
        // Mongoose ID (_id) alapján történő keresés
        const enekes = await Enekes.findById(req.params.id).lean(); 
        if (!enekes) {
            return res.status(404).send('Énekes nem található.');
        }
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
        
        req.session.messages = ['Énekes sikeresen frissítve.'];
        res.redirect('/crud');
    } catch (error) {
        console.error('Hiba az énekes frissítésekor:', error);
        // Hiba esetén visszatöltjük az űrlapot
        res.render('crud/enekes_form', { 
            title: 'Énekes szerkesztése', 
            enekes: { _id: req.params.id, nev, szulev }, 
            error: 'Hiba történt a frissítés során.' 
        });
    }
});

// ----------------------
// Énekes Törlése (DELETE) - /crud/delete/:id
// ----------------------
router.post('/delete/:id', ensureAdmin, async (req, res) => {
    try {
        // Mongoose: dokumentum törlése az ID alapján
        const deletedEnekes = await Enekes.findByIdAndDelete(req.params.id);
        
        // Mivel a repertoárban az originalId-t használjuk, a repertoár tételeket is törölni kell:
        if(deletedEnekes) {
            await Repertoar.deleteMany({ enekesid: deletedEnekes.originalId });
        }
        
        req.session.messages = ['Énekes sikeresen törölve.'];
        res.redirect('/crud');
    } catch (error) {
        console.error('Hiba az énekes törlésekor:', error);
        req.session.messages = ['Hiba történt a törlés során.'];
        res.redirect('/crud');
    }
});

module.exports = router;
