require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const db = require('./config/db');
const Message = require('./models/Message'); 

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const messagesRouter = require('./routes/messages');
const crudRouter = require('./routes/crud');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'titok',
  resave: false,
  saveUninitialized: false
}));

app.use(async (req, res, next) => {
  res.locals.user = req.session.user || null;
  
  try {
      if (req.session.user && req.session.user.role === 'admin') {
          res.locals.unreadCount = await Message.countDocuments({ reply: null });
      } else if (req.session.user) {
          res.locals.unreadCount = await Message.countDocuments({ 
              sender_id: req.session.user._id,
              reply: { $ne: null }
          });
      } else {
          res.locals.unreadCount = 0;
      }
  } catch (err) {
      res.locals.unreadCount = 0;
  }
  
  next();
});

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/messages', messagesRouter);
app.use('/crud', crudRouter);

module.exports = app;