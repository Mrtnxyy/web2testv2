// indito.js

// Modulok importálása
const express = require('express');
const expressLayouts = require('express-ejs-layouts'); // <-- Importálva
const app = express();
const dotenv = require('dotenv').config(); 
const session = require('express-session');
const indexRouter = require('./routes/index'); // Az útvonalakat tartalmazó fájl

const PORT = process.env.PORT || 10000;

// KÖZTES SZOFTVER (MIDDLEWARE) BEÁLLÍTÁSOK

// Statikus fájlok (CSS, JS) mappájának beállítása
app.use(express.static('public'));

// 1. Session beállítások
app.use(session({
    secret: process.env.SESSION_SECRET || 'valami_titkos',
    resave: false,
    saveUninitialized: true,
}));

// Body-parser a POST adatok feldolgozásához
app.use(express.urlencoded({ extended: true }));


// 2. KRITIKUS JAVÍTÁS: user változó beállítása
// Ezt a session beállítása után kell futtatni, hogy a req.session.user elérhető legyen.
app.use((req, res, next) => {
    // A req.session.user változót teszi elérhetővé a nézetek számára 'user' néven.
    // Ez oldja meg a 'user is not defined' hibát a layout.ejs-ben.
    res.locals.user = req.session.user; 
    next();
});


// 3. Express Layouts beállítása
app.use(expressLayouts); // <-- KRITIKUS: Aktiválva

// 4. EJS beállítása mint nézetmotor
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); 

// Alapértelmezett layout beállítása
app.set('layout', 'layout'); // <-- views/layout.ejs használata

// ÚTVONALAK (ROUTES) BEÁLLÍTÁSA
app.use('/', indexRouter);


// SZERVER INDÍTÁSA
app.listen(PORT, () => {
    console.log(`Alkalmazás fut: http://localhost:${PORT} (port ${PORT})`);
});
