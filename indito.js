// indito.js

// Modulok importálása
const express = require('express');
const expressLayouts = require('express-ejs-layouts'); // <-- Fontos: Importálva
const app = express();
const dotenv = require('dotenv').config(); 
const session = require('express-session');
const indexRouter = require('./routes/index'); 

const PORT = process.env.PORT || 10000;

// KÖZTES SZOFTVER (MIDDLEWARE) BEÁLLÍTÁSOK

// Statikus fájlok (CSS, JS) mappájának beállítása
app.use(express.static('public'));

// Session beállítások
app.use(session({
    secret: process.env.SESSION_SECRET || 'valami_titkos',
    resave: false,
    saveUninitialized: true,
}));

// Body-parser a POST adatok feldolgozásához
app.use(express.urlencoded({ extended: true }));

// Express Layouts beállítása
app.use(expressLayouts); // <-- KRITIKUS: Aktiválva

// EJS beállítása mint nézetmotor
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); 

// Alapértelmezett layout beállítása:
// Mivel a layout.ejs a views mappában van, a neve 'layout'
app.set('layout', 'layout'); // <-- KRITIKUS: Beállítva

// ÚTVONALAK (ROUTES) BEÁLLÍTÁSA
app.use('/', indexRouter);


// SZERVER INDÍTÁSA
app.listen(PORT, () => {
    console.log(`Alkalmazás fut: http://localhost:${PORT} (port ${PORT})`);
});
