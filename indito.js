const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const dotenv = require('dotenv').config(); 
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override'); // Kell, ha van POST/DELETE/PUT

const indexRouter = require('./routes/index'); 
const authRouter = require('./routes/auth');
const crudRouter = require('./routes/crud');
const messagesRouter = require('./routes/messages'); // Mivel az auth és crud igényli, feltételezzük, hogy kellhet

const PORT = process.env.PORT || 10000;

// ADATBÁZIS CSATLAKOZÁS
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Csatlakozás sikeres!'))
    .catch(err => console.error('MongoDB Csatlakozási hiba:', err));

// KÖZTES SZOFTVER (MIDDLEWARE) BEÁLLÍTÁSOK

// Statikus fájlok beállítása (Public mappa)
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method')); // Ha method-override-ot használsz

// Session beállítások
app.use(session({
    secret: process.env.SESSION_SECRET || 'valami_titkos',
    resave: false,
    saveUninitialized: true,
}));

// Body-parser a POST adatok feldolgozásához
app.use(express.urlencoded({ extended: true }));

// KRITIKUS JAVÍTÁS: Globális User és Flash Message Middleware
app.use((req, res, next) => {
    // 1. User adat átadása a nézeteknek
    res.locals.user = req.session.user || null;
    
    // 2. Flash Message kezelése: Átadja az üzenetet a nézetnek, majd törli a sessionből
    res.locals.messages = req.session.messages;
    delete req.session.messages; 
    
    next();
});

// Express Layouts beállítása
app.use(expressLayouts);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.set('layout', 'layout'); 

// ÚTVONALAK (ROUTES) BEÁLLÍTÁSA
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/crud', crudRouter);
app.use('/messages', messagesRouter); // Messages router hozzáadva

// SZERVER INDÍTÁSA
app.listen(PORT, () => {
    console.log(`Alkalmazás fut: http://localhost:${PORT} (port ${PORT})`);
});
