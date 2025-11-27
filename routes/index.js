const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); // Biztosítsd, hogy ez a fájl létezik a models mappában!

// --- FŐOLDAL ---
router.get('/', (req, res) => {
    const successMsg = req.query.msg === 'sent' ? 'Üzenet sikeresen elküldve!' : null;
    // A user-t nem kell külön átadni, mert az app.js megoldja (res.locals.user)
    res.render('index', { successMsg }); 
});

// --- KAPCSOLAT ŰRLAP MENTÉSE ---
router.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        await Message.create({
            name,
            email,
            message
        });

        res.redirect('/?msg=sent');
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// --- PROFIL OLDAL (JAVÍTVA) ---
router.get('/profile', (req, res) => {
    // ITT VOLT A HIBA: req.user helyett req.session.user kell!
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('profile', { user: req.session.user });
});

// --- ÜZENETEK LISTÁZÁSA (JAVÍTVA) ---
router.get('/messages', async (req, res) => {
    // ITT IS: req.session.user ellenőrzése
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    
    try {
        const messages = await Message.find().sort({ created_at: -1 });
        res.render('messages', { messages });
    } catch (err) {
        console.error(err);
        res.render('messages', { messages: [] });
    }
});

// --- ADMIN OLDAL (JAVÍTVA) ---
router.get('/admin', (req, res) => {
    // Admin jog ellenőrzése is a session-ből
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/');
    }
    res.render('admin');
});

module.exports = router;