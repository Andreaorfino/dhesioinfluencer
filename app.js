const path = require('path');
const fs = require('fs');
var sslRedirect = require('heroku-ssl-redirect');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const paypal = require('paypal-rest-sdk');

const errorController = require('./controllers/error');
const User = require('./models/user');
const Influencer = require('./models/influencer');

const dotenv = require('dotenv');
dotenv.config();


const app = express();

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.originalname.charAt(0) == 'L') {
      cb(null, 'images/singlepage/L');
    } else if (file.originalname.charAt(0) == 'P') {
      cb(null, 'images/singlepage/P');
    } else {
      console.log(file.originalname)
      cb(null, 'images/influencer');
    }
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-ciao-${Date.now()}.${ext}`); //
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');



//log
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

app.use(sslRedirect());
app.use(helmet());
app.use(compression());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

//mongo 
const MONGODB_URI = process.env.MONGODB_URI;

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
  ttl: 30 * 24 * 60 * 60
});

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

//session
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  if (req.session.typeUser == 'influencer') {
    Influencer.findById(req.session.user._id)
      .then(user => {
        if (!user) {
          return next();
        }
        req.user = user;
        next();
      })
      .catch(err => {
        next(new Error(err));
      });
  } else {
    next();
  }
});

//csrf 
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

//route
const influencerRoutes = require('./routes/influencer');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const fornitoreRoutes = require('./routes/fornitore');
const collaborazioniRoutes = require('./routes/collaborazioni');

app.use('/influencer', influencerRoutes);
app.use('/admin', adminRoutes);
app.use('/collaborazioni',collaborazioniRoutes);
app.use('/aziende', fornitoreRoutes);
app.use(shopRoutes);
app.use(authRoutes);

//error
app.get('/500', errorController.get500);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

app.use(errorController.get404);



mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => {
    console.log(err);
  });
