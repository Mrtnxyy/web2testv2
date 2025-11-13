// indito.js

// Modulok importálása
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const dotenv = require('dotenv').config(); 
const session = require('express-session');
const mongoose = require('mongoose'); // <-- Mongoose hozzáadva

// Útvonal fájlok importálása
const indexRouter = require('./routes/index'); 
const authRouter = require('./routes/auth');
const crudRouter = require('./routes/crud'); 

const PORT = process.env.PORT || 10000;

// ADATBÁZIS CSATLAKOZÁS (MongoDB)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Csatlakozás sikeres!'))
    .catch(err => console.error('MongoDB Csatlakozási hiba:', err));

// KÖZTES SZOFTVER (MIDDLEWARE) BEÁLLÍTÁSOK
app.use(express.static('public'));

// Session beállítások
app.use(session({
    secret: process.env.SESSION_SECRET || 'valami_titkos',
    resave: false,
    saveUninitialized: true,
}));

// Body-parser a POST adatok feldolgozásához
app.use(express.urlencoded({ extended: true }));


// KRITIKUS JAVÍTÁS: user változó beállítása
app.use((req, res, next) => {
    res.locals.user = req.session.user; 
    next();
});


// Express Layouts beállítása
app.use(expressLayouts);

// EJS beállítása mint nézetmotor
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); 
app.set('layout', 'layout'); 


// ÚTVONALAK (ROUTES) BEÁLLÍTÁSA
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/crud', crudRouter);


// SZERVER INDÍTÁSA
app.listen(PORT, () => {
    console.log(`Alkalmazás fut: http://localhost:${PORT} (port ${PORT})`);
});
