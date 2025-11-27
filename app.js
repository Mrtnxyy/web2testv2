require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const messagesRouter = require('./routes/messages');
const crudRouter = require('./routes/crud');

const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Csatlakozva!'))
  .catch(err => console.log(err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- FORM ADATOK KEZELÉSE ---
app.use(bodyParser.urlencoded({ extended: true }));

// --- EZ A SOR HIÁNYZOTT! (Ez kell a csúszkához/JSON-hoz) ---
app.use(express.json()); 

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'titok',
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/messages', messagesRouter);
app.use('/crud', crudRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Szerver fut: http://localhost:${PORT}`);
});

module.exports = app;