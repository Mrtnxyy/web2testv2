const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Enekes = require('../models/Enekes');
const Szerep = require('../models/Szerep');
const Repertoar = require('../models/Repertoar');
const Mu = require('../models/Mu');

router.get('/', (req, res) => {
    const successMsg = req.query.msg === 'sent' ? 'Üzenet sikeresen elküldve!' : null;
    res.render('index', { successMsg }); 
});

router.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const senderId = req.session.user ? req.session.user._id : null;

        await Message.create({ 
            name, 
            email, 
            message,
            sender_id: senderId 
        });
        res.redirect('/?msg=sent');
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

router.get('/profile', (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    res.render('profile', { user: req.session.user });
});

router.get('/messages', async (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    try {
        let messages;
        
        if (req.session.user.role === 'admin') {
            messages = await Message.find().sort({ created_at: -1 });
            await Message.updateMany({ read: false }, { read: true });
        } else {
            messages = await Message.find({ sender_id: req.session.user._id }).sort({ created_at: -1 });
        }

        const successMsg = req.query.msg === 'replied' ? 'Válasz elküldve!' : (req.query.msg === 'deleted' ? 'Üzenet törölve!' : null);
        
        res.render('messages', { messages, successMsg, user: req.session.user });
    } catch (err) {
        console.error(err);
        res.render('messages', { messages: [], successMsg: null, user: req.session.user });
    }
});

router.post('/messages/reply/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/');

    try {
        await Message.findByIdAndUpdate(req.params.id, {
            reply: req.body.replyText,
            replied_at: new Date()
        });
        res.redirect('/messages?msg=replied');
    } catch (err) {
        console.error(err);
        res.redirect('/messages');
    }
});

router.post('/messages/delete/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/');
    
    try {
        const msg = await Message.findById(req.params.id);
        if (!msg) return res.redirect('/messages');

        if (req.session.user.role === 'admin' || String(msg.sender_id) === String(req.session.user._id)) {
            await Message.findByIdAndDelete(req.params.id);
            res.redirect('/messages?msg=deleted');
        } else {
            res.status(403).send('Nincs jogosultságod törölni ezt az üzenetet.');
        }
    } catch (err) {
        console.error(err);
        res.redirect('/messages');
    }
});

router.get('/admin', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/');
    
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

router.post('/admin/toggle-role', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Nincs jogosultságod!' });
    }

    const { userId, newRole } = req.body;

    if (String(userId) === String(req.session.user._id)) {
        return res.status(400).json({ error: 'Saját magadtól nem veheted el a jogot!' });
    }

    try {
        await User.findByIdAndUpdate(userId, { role: newRole });
        res.json({ success: true });
    } catch (err) {
        console.error("ADATBÁZIS HIBA:", err);
        res.status(500).json({ error: err.message });
    }
});

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
            }).filter(i => i !== null);
            return { ...enekes, szerepek: szerepLista };
        });
        res.render('adatbazis_lista', { enekesek: enekesAdatok.slice(0, 100) });
    } catch (err) {
        res.status(500).send('Hiba történt az adatok betöltésekor.');
    }
});

module.exports = router;