const express = require('express');
const router = express.Router();

const Enekes = require('../models/Enekes'); 
const Mu = require('../models/Mu'); 
const Szerep = require('../models/Szerep'); 
const Repertoar = require('../models/Repertoar'); 

function ensureAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.redirect('/'); 
}

router.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    
    try {
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

router.get('/add', ensureAdmin, (req, res) => {
    res.render('crud/enekes_form', { 
        title: 'Új énekes hozzáadása', 
        enekes: {},
        error: null 
    });
});

router.post('/add', ensureAdmin, async (req, res) => {
    const { nev, szulev } = req.body;
    try {
        const lastEnekes = await Enekes.findOne().sort({ originalId: -1 });
        const newOriginalId = (lastEnekes ? lastEnekes.originalId : 0) + 1;

        await Enekes.create({ 
            originalId: newOriginalId,
            nev: nev, 
            szulev: parseInt(szulev) 
        });
        
        req.session.messages = ['Új énekes sikeresen hozzáadva.'];
        res.redirect('/crud');
    } catch (error) {
        console.error('Hiba az énekes hozzáadásakor:', error);
        res.render('crud/enekes_form', { 
            title: 'Új énekes hozzáadása', 
            enekes: req.body, 
            error: 'Adatbázis hiba történt a beszúrás során.' 
        });
    }
});

router.get('/edit/:id', ensureAdmin, async (req, res) => {
    try {
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

router.post('/edit/:id', ensureAdmin, async (req, res) => {
    const { nev, szulev } = req.body;
    try {
        await Enekes.findByIdAndUpdate(req.params.id, { 
            nev: nev, 
            szulev: parseInt(szulev) 
        });
        
        req.session.messages = ['Énekes sikeresen frissítve.'];
        res.redirect('/crud');
    } catch (error) {
        console.error('Hiba az énekes frissítésekor:', error);
        res.render('crud/enekes_form', { 
            title: 'Énekes szerkesztése', 
            enekes: { _id: req.params.id, nev, szulev }, 
            error: 'Hiba történt a frissítés során.' 
        });
    }
});

router.post('/delete/:id', ensureAdmin, async (req, res) => {
    try {
        const deletedEnekes = await Enekes.findByIdAndDelete(req.params.id);
        
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