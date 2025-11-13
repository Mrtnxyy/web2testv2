// indito.js

// Modulok importálása
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const dotenv = require('dotenv').config(); 
const session = require('express-session');

// Útvonal fájlok importálása
const indexRouter = require('./routes/index'); 
const authRouter = require('./routes/auth');   // <-- Új: Auth útvonal
const crudRouter = require('./routes/crud');   // <-- Új: CRUD útvonal

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
app.use((req, res, next) => {
    res.locals.user = req.session.user; 
    next();
});


// 3. Express Layouts beállítása
app.use(expressLayouts);

// 4. EJS beállítása mint nézetmotor
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); 

// Alapértelmezett layout beállítása
app.set('layout', 'layout'); 

// ÚTVONALAK (ROUTES) BEÁLLÍTÁSA
app.use('/', indexRouter);
app.use('/auth', authRouter); // <-- Új: /auth/* útvonalak aktiválása
app.use('/crud', crudRouter); // <-- Új: /crud/* útvonalak aktiválása


// SZERVER INDÍTÁSA
app.listen(PORT, () => {
    console.log(`Alkalmazás fut: http://localhost:${PORT} (port ${PORT})`);
});
