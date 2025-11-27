const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

router.get('/', (req, res) => {
    const successMsg = req.query.msg === 'sent' ? 'Üzenet sikeresen elküldve!' : null;
    res.render('index', { successMsg }); 
});

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

router.get('/profile', (req, res) => {
    if (!req.user) {
        return res.redirect('/auth/login');
    }
    res.render('profile', { user: req.user });
});

router.get('/messages', async (req, res) => {
    if (!req.user) {
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

router.get('/admin', (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.redirect('/');
    }
    res.render('admin');
});

module.exports = router;