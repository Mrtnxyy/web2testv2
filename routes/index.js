const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User'); 

router.get('/', (req, res) => {
    const successMsg = req.query.msg === 'sent' ? 'Üzenet sikeresen elküldve!' : null;
    res.render('index', { successMsg }); 
});

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

router.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('profile', { user: req.session.user });
});

router.get('/messages', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/');
    }
    try {
        const messages = await Message.find().sort({ created_at: -1 });
        res.render('messages', { messages });
    } catch (err) {
        console.error(err);
        res.render('messages', { messages: [] });
    }
});

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

router.post('/admin/toggle-role', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Nincs jogosultságod' });
    }

    const { userId, newRole } = req.body;

    // Védelem: ID összehasonlítása Stringként
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

module.exports = router;