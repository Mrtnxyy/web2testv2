const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const dotenv = require('dotenv').config(); 
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');

const indexRouter = require('./routes/index'); 
const authRouter = require('./routes/auth');
const crudRouter = require('./routes/crud');
const messagesRouter = require('./routes/messages');

const PORT = process.env.PORT || 10000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Csatlakozás sikeres!'))
    .catch(err => console.error('MongoDB Csatlakozási hiba:', err));

app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'valami_titkos',
    resave: false,
    saveUninitialized: true,
}));

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;

    res.locals.messages = req.session.messages;
    delete req.session.messages; 
    
    next();
});

app.use(expressLayouts);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.set('layout', 'layout'); 

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/crud', crudRouter);
app.use('/messages', messagesRouter);

app.listen(PORT, () => {
    console.log(`Alkalmazás fut: http://localhost:${PORT} (port ${PORT})`);
});
