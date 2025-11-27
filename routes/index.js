const express = require('express');
const router = express.Router();

// Modellek importálása
const Message = require('../models/Message');
const User = require('../models/User');
const Enekes = require('../models/Enekes');
const Szerep = require('../models/Szerep');
const Repertoar = require('../models/Repertoar');
const Mu = require('../models/Mu');

// --- FŐOLDAL ---
router.get('/', (req, res) => {
    const successMsg = req.query.msg === 'sent' ? 'Üzenet sikeresen elküldve!' : null;
    res.render('index', { successMsg }); 
});

// --- KAPCSOLAT ŰRLAP (Üzenet mentése) ---
router.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        await Message.create({ name, email, message });
        res.redirect('/?msg=sent');
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// --- PROFIL OLDAL (Csak belépve) ---
router.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('profile', { user: req.session.user });
});

// --- ÜZENETEK LISTÁZÁSA (Csak Adminnak) ---
router.get('/messages', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/');
    }
    try {
        const messages = await Message.find().sort({ created_at: -1 });
        // Flash üzenet kezelése törlés után
        const successMsg = req.query.msg === 'deleted' ? 'Üzenet törölve!' : null;
        res.render('messages', { messages, successMsg });
    } catch (err) {
        console.error(err);
        res.render('messages', { messages: [], successMsg: null });
    }
});

// --- ÚJ: ÜZENET TÖRLÉSE (Csak Adminnak) ---
router.post('/messages/delete/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/');
    }
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.redirect('/messages?msg=deleted');
    } catch (err) {
        console.error(err);
        res.redirect('/messages');
    }
});

// --- ADMIN OLDAL (Felhasználók kezelése) ---
router.get('/admin', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/');
    }

    try {
        const users = await User.find().sort({ created_at: -1 });
        const admins = users.filter(u => u.role === 'admin');
        
        res.render('admin', { 
            allUsers: users, 
            admins: admins,
            currentUser: req.session.user 
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// --- ADMIN: JOGOSULTSÁG VÁLTÁS ---
router.post('/admin/toggle-role', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Nincs jogosultságod' });
    }

    const { userId, newRole } = req.body;

    if (String(userId) === String(req.session.user._id)) {
        return res.status(400).json({ error: 'Saját magadtól nem veheted el a jogot!' });
    }

    try {
        await User.findByIdAndUpdate(userId, { role: newRole });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba történt' });
    }
});

// --- REPERTOÁR / ADATBÁZIS LISTA ---
router.get('/adatbazis', async (req, res) => {
    try {
        const enekesek = await Enekes.find().sort({ nev: 1 }).lean();
        const repertoar = await Repertoar.find().lean();
        const szerepek = await Szerep.find().lean();
        const muvek = await Mu.find().lean();

        const enekesAdatok = enekesek.map(enekes => {
            const sajatRepertoar = repertoar.filter(r => r.enekesid === enekes.id);
            
            const szerepLista = sajatRepertoar.map(rep => {
                const szerep = szerepek.find(sz => sz.id === rep.szerepid);
                if (!szerep) return null;

                const mu = muvek.find(m => m.id === szerep.muid);
                
                return {
                    szerepnev: szerep.szerepnev,
                    muCim: mu ? mu.cim : '?',
                    szerzo: mu ? mu.szerzo : '?',
                    utoljara: rep.utoljara
                };
            }).filter(item => item !== null);

            return {
                ...enekes,
                szerepek: szerepLista
            };
        });

        res.render('adatbazis_lista', { enekesek: enekesAdatok.slice(0, 100) });

    } catch (err) {
        console.error('Adatbázis hiba:', err);
        res.status(500).send('Hiba történt az adatok betöltésekor.');
    }
});

module.exports = router;