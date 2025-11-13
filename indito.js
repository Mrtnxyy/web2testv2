// indito.js

// 1. Modulok importálása
const express = require('express');
const expressLayouts = require('express-ejs-layouts'); // <-- EZ A Csomag
const app = express();
const dotenv = require('dotenv').config(); // A környezeti változók betöltése

// A port beállítása a Renderhez, vagy 10000 ha nincs beállítva
const PORT = process.env.PORT || 10000;

// 2. KÖZTES SZOFTVER (MIDDLEWARE) BEÁLLÍTÁSOK

// Statikus fájlok (CSS, JS) mappájának beállítása
app.use(express.static('public'));

// Express Layouts beállítása az EJS-hez
app.use(expressLayouts); // <--- EZ A KRITIKUS SOR!

// EJS beállítása mint nézetmotor
app.set('view engine', 'ejs');
// feltételezve, hogy a nézetfájlok a /views mappában vannak
app.set('views', __dirname + '/views'); 
app.set('layout', 'layouts/layout'); // Alapértelmezett layout fájl beállítása

// Session beállítások (a MemoryStore-t éles környezetben cseréld le!)
const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET || 'valami_titkos',
    resave: false,
    saveUninitialized: true,
    // Megjegyzés: MemoryStore (alapértelmezett) nem alkalmas éles környezetre!
}));

// Body-parser a POST adatok feldolgozásához
app.use(express.urlencoded({ extended: true }));


// 3. ÚTVONALAK (ROUTES) BEÁLLÍTÁSA

// Index útvonal importálása és használata
const indexRouter = require('./routes/index');
app.use('/', indexRouter);


// 4. SZERVER INDÍTÁSA

app.listen(PORT, () => {
    console.log(`Alkalmazás fut: http://localhost:${PORT} (port ${PORT})`);
});
