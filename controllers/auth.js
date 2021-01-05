const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');
const Product = require('../models/product');

//-----------------------------------
//----------- inizio nuovi controller
//-----------------------------------

/* recupera la pagina di registrazione normale */
exports.getRegistrazione = (req, res, next) => {

  return res.render('singlepage/registrazione', {
    path: '/signup',
    pageTitle: 'Registrazione',

    /* i valori successivi servono quando si inserisce un id instagram già presente
    in questo caso sono vuoti perché non usati */
    errore: false,
    sesso: '',
    eta: '',
    tab: 0,
    idinsta: ''

  });
}

/* effettua la registrazione di un nuovo utente */
exports.postRegistrazione = (req, res, next) => {

  /* recupero di tutti i valori della form */
  const password = req.body.password;
  const nickname = req.body.uname.toLowerCase().replace(/\s/g, '').replace(/@/g, '');
  const sex = req.body.sesso;
  const age = req.body.eta;

  /* provo a vedere se esiste già un'account con quel id instagram */
  User.findOne({ nickname: nickname })
    .then(res1 => {
      let allRight = true;

      /* se esiste già si ritornano i valori già inseriti dal utente 
	 e si torna all'inserimento del id instagram */
      if (res1) {
        allRight = false;
        return res.render('singlepage/registrazione', {
          path: '/signup',
          pageTitle: 'Registrazione',
          errore: true,
          sesso: sex,
          eta: age,
          tab: 2,
          idinsta: nickname
        });
      }

      /* nel caso non esista già un account omonimo si procede eseguendo l'hash della password*/
      if (allRight) return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {

          /* si conta quanti sono già gli iscritti */
          return User.count({}, function (err, count) {

            const user = new User({
              nickname: nickname,
              password: hashedPassword,
              chance: 1,
              niscrizione: count + 1,
              cart: { items: [], },
              bought: { items: [], },
              sesso: sex,
              eta: age,
            })


            /* si salva l'utente */
            return user.save().then(result => {
              let coccarda = "";
              let isCoccarda = false;
              /* decido se far apparire la coccarda per il numero di iscritti corrispondente */
              if (count < 2001) {
                coccarda = 'coccarda1.png';
                isCoccarda = true;
              }
              /* si carica la pagina di registrazione avvenuta */
              return res.render('singlepage/RegistrazioneCompletata', {
                path: '/RegistrazioneCompletata',
                pageTitle: 'Registrazione Completata',
                nickname: nickname,
                coccarda: coccarda,
                isCoccarda: isCoccarda
              });
            });
          });
        });
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

/* carica la pagina di login */
exports.postAccedi = (req, res, next) => {
  let nuovo;
  if (req.body.nuovo == "1") nuovo = true;
  return res.render('singlepage/login', {
    path: '/accedi',
    pageTitle: 'Accedi',
    nuovo: nuovo,
    /* necessari se poi si sbaglia ad inserire i dati */
    error: false,
    nickname: '',

  });
}

exports.getAccedi = (req, res, next) => {

  return res.render('singlepage/login', {
    path: '/accedi',
    pageTitle: 'Accedi',
    nuovo: false,
    /* necessari se poi si sbaglia ad inserire i dati */
    error: false,
    nickname: '',

  });
}


/* accede all'account corrispondente */
exports.postLogin = (req, res, next) => {
  /* dati della form */
  const nickname = req.body.nickname.toLowerCase().replace(/\s/g, '').replace(/@/g, '');
  const password = req.body.password;




  /* recupero dell'account con l'attuale nickname */
  User.findOne({ nickname: nickname })
    .then(user => {

      console.log(nickname);
      if (!user) {

        /* se non si ha l'id instagram inserito nel database si ritorna l'errore */
        return res.status(422).render('singlepage/login', {
          path: '/accedi',
          pageTitle: 'Accedi',
          error: true,
          nickname: nickname,
          nuovo: false
        });
      }

      /* si effettusa l'hash della password appena inserita e la si confronta con 
      l'hash presente nell'account con il dato id instagram */
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {



          /* se corrispondono l'utente viene salvato nella sessione */
          if (doMatch) {

            req.session.isLoggedIn = true;
            req.session.user = user;

            /* si ritorna alla home */
            return req.session.save(err => {
              res.redirect('/');
            });
          }

          /* se non corrisponde la password si ritorna alla pagina di login con l'errore */
          return res.status(422).render('singlepage/login', {
            path: '/accedi',
            pageTitle: 'Accedi',
            error: true,
            nickname: nickname,
            nuovo: false
          });
        })
        .catch(err => {
          res.redirect('/accedi');
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

/* ritorna la pagina di registrazione 
* usata solo per prove */
exports.getRegistrazioneCompletata = (req, res, next) => {

  return res.render('singlepage/RegistrazioneCompletata', {
    path: '/RegistrazioneCompletata',
    pageTitle: 'Registrazione Completata',
    nickname: 'nome',
    coccarda: 'coccarda1.png',
    isCoccarda: true
  });
}

/* effettua il logout cancellando la sessione */
exports.postLogout = (req, res, next) => {
  const utente = req.user.nickname

  req.session.destroy(err => {
    return res.render('singlepage/logout', {
      path: '/logout',
      pageTitle: 'logout',
      user: utente,
      urlEvento: req.body.urlEvento
    });
  });
};

/* effettua la cancellazione cancellando la sessione e l'utente nel db */
exports.postCancella = (req, res, next) => {
  const utente = req.user.nickname
  req.session.destroy(err => {
    return User.deleteOne({ "nickname": utente })
      .then(res1 => {
        return res.render('singlepage/cancellazione', {
          path: '/cancellazione',
          pageTitle: 'Eliminazione Account',
          user: utente,
          urlEvento: req.body.urlEvento
        });
      }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  })
};


/* controller di test per construire le pagine */
exports.getSicuro = (req, res, next) => {
  return res.render('singlepage/canc1', {
    path: '/Eliminazione_account',
    pageTitle: 'Eliminazione Account :(',
    utente: req.user.nickname,
    urlEvento: req.body.urlEvento
  });
};

exports.getResetPassword = (req, res, next) => {
  const resetToken = req.params.resetToken;

  return User.findOne({ resetToken: resetToken })
    .then((user) => {
      return res.render('singlepage/resetpassword', {
        path: '/resetpassword',
        pageTitle: 'Reset Password',
        resetToken: resetToken,
        user: user
      });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postResetPassword = (req, res, next) => {

  const resetToken = req.body.resetToken;
  const password = req.body.password;

  return User.findOne({ resetToken: resetToken })
    .then((user) => {
      user.resetToken = '';
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          user.password = hashedPassword;
          return user.save()
            .then(result => {
              return res.redirect('/accedi')
            });
        });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

function giaComprato(carrello, prodId) {
  let giaComprato = false;
  carrello.items.forEach((item) => {
    if(item.productId == prodId){
      giaComprato = true;
    }
  })
  return giaComprato;
}

exports.postButtamiDentroSconti = (req, res, next) => {
  const nickname = req.body.nicknameTikTok.toLowerCase().replace(/\s/g, '').replace(/@/g, '');
  const urlPagina = 'imieisconti?urlEvento=' + req.body.urlPagina;

  User.findOne({ nickname: nickname })
    .then(user => {

      if (!user) {

        return User.count({}, function (err, count) {

          const user = new User({
            nickname: nickname,
            chance: 1,
            niscrizione: count + 1,
            cart: { items: [], },
            bought: { items: [], },
            sesso: 'sex',
            eta: 'age',
          })

          return user.save().then(result => {

            req.session.isLoggedIn = true;
            req.session.user = user;

            return res.redirect(urlPagina);



          });
        })

      } else {

        req.session.isLoggedIn = true;
        req.session.user = user;
        return res.redirect(urlPagina);

      }

    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

/* accede all'account corrispondente */
exports.postButtamiDentro = (req, res, next) => {
  /* dati della form */
  const nickname = req.body.nicknameTikTok.toLowerCase().replace(/\s/g, '').replace(/@/g, '');
  const urlPagina = '/' + req.body.urlPagina;
  const prodId = req.body.productId;

  /* recupero dell'account con l'attuale nickname */
  User.findOne({ nickname: nickname })
    .then(user => {

      if (!user) {

        return User.count({}, function (err, count) {

          const user = new User({
            nickname: nickname,
            chance: 1,
            niscrizione: count + 1,
            cart: { items: [], },
            bought: { items: [], },
            sesso: 'sex',
            eta: 'age',
          })

          return user.save().then(result => {

            req.session.isLoggedIn = true;
            req.session.user = user;

            Product.findById(prodId)
              .then(product => {

                /* aggiunge la lotteria alla lista di lotterie dell'utente */
                return user.addToCart(product)
                  .then(res1 => {

                    /* aggiunge alla lotteria l'utente che si è iscritto */
                    return product.addToInscritto(user).then(res1 => {
                      user.notificaSconti = 1;
                      return user.save().then(res2 => { return res.redirect(urlPagina); });
                    })
                  });

              })

            /* si carica la pagina di registrazione avvenuta */


          });
        })

      } else {

        req.session.isLoggedIn = true;
        req.session.user = user;

        Product.findById(prodId)
          .then(product => {

            if(giaComprato(user.cart, prodId)){ 
              req.session.giaPartecipato = true;
              return res.redirect(urlPagina);
            }
            /* aggiunge la lotteria alla lista di lotterie dell'utente */
            return user.addToCart(product)
              .then(res1 => {

                /* aggiunge alla lotteria l'utente che si è iscritto */
                return product.addToInscritto(user).then(res1 => {
                  user.notificaSconti = 1;
                  return user.save().then(res2 => { return res.redirect(urlPagina); });
                })
              });

          })
      }

    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};