const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const https = require('https');

const Product = require('../models/product');
const Periodo = require('../models/periodo');
const User = require('../models/user');
const Collaborazione = require('../models/collaborazione');
const Influencer = require('../models/influencer');



function giaComprato(carrello, prodId) {
  let giaComprato = false;
  carrello.items.forEach((item) => {
    if(item.productId == prodId){
      giaComprato = true;
    }
  })
  return giaComprato;
}

//-----------------------------------
//----------- inizio nuovi controller
//-----------------------------------

exports.getSinglePage = (req, res, next) => {

  //return res.redirect('/aziende/staarrivando');
  Collaborazione.find()
  .sort({_id: -1})
  .limit(50)
  .populate('autore')
  .populate('fornitore')
  .then((collaborazioni) => {
    if (req.session.isLoggedIn) {
    return res.render('home/index', {
      pageTitle: 'Dhesìo',
      collaborazioni: collaborazioni,
      isAuthenticated: true,
      user: req.user
    })
  } else {
    return res.render('home/index', {
      pageTitle: 'Dhesìo',
      isAuthenticated: false,
      collaborazioni: collaborazioni
    })
  }
  })
}

/* carica la pagina di aiuto
se l'utente è loggato allora lo passerà per far apparire il tasto di logout*/
exports.getAiuto = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.render('home/aiuto', {
      pageTitle: 'FAQ',
      autenticato: true,
      user: req.user,
      urlEvento: req.query.urlEvento,
    });
  } else {
    return res.render('home/aiuto', {
      pageTitle: 'FAQ',
      autenticato: false,
      urlEvento: req.query.urlEvento,
    });
  }
}

/* carica la pagina con i dettagli della lotteria */
exports.getEvento = (req, res, next) => {

  /* prende l'id della lotteria  */
  const prodId = req.params.productId;

  /* prende la db la lotteria corrispondente */
  Product.findById(prodId)
    .then(product => {

      if ((new Date(product.timeoutUtenti) - new Date((new Date()).getTime() + 3600000 * 2)) < 0) {
        product.chiusa = true;
      }

      /* determina la lunghezza della barra */
      product.barra = get_bar_progress(new Date(product.timeoutUtenti) - new Date(new Date().getTime() + 3600000 * 2), product.totaleOre);

      let nickname = '';
      let iscoccarda = false;
      let coccardaimg = '';
      let chance = 0;

      if (req.session.isLoggedIn) {
        nickname = req.user.nickname;
        if (req.user.niscrizione < 1000) {
          coccardaimg = '/images/singlepage/coccarda1.png';
          iscoccarda = true;
        }
        chance = req.user.chance;
      }

      /* carica la pagina della singola lotteria */
      return res.render('singlepage/singoloprodotto', {
        prodotto: product,
        pageTitle: "Dettagli",
        autenticato: req.session.isLoggedIn,
        coccarda: coccardaimg,
        iscoccarda: iscoccarda,
        user: req.user,
        path: '/evento',
        chance: chance
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

/* iscrive un utente alla lotteria corrispondente*/
exports.postCart = (req, res, next) => {
  /* recupera l'id della lotteria corrispondente */
  const prodId = req.body.productId;
  const urlPagina = '/' + req.body.urlPagina;

  /* prende dal db il prodotto  */
  Product.findById(prodId)
    .then(product => {

      /* verifica che l'utente abbia ancora chance */

      /* prende la lista di lotterie dell'utente */
      if(giaComprato(req.user.cart, prodId)) {
        req.session.giaPartecipato = true;
        return res.redirect(urlPagina);
      }

      /* aggiunge la lotteria alla lista di lotterie dell'utente */
      return req.user.addToCart(product)
        .then(res1 => {

          /* toglie una chance all'utente */

          /* aggiunge alla lotteria l'utente che si è iscritto */
          return product.addToInscritto(req.user).then(res1 => {
            req.user.notificaSconti = 1;
            return req.user.save().then(res2 => { return res.redirect('/'); });
          })
        });

    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

/* privacy policy controller */
exports.getPrivacy = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.render('coseLegali/legale', {
      pageTitle: 'Privacy Policy Influencer',
      autenticato: true,
    });
  } else {
    return res.render('coseLegali/legale', {
      pageTitle: 'Privacy Policy Influencer',
      autenticato: false,
    });
  }
}

exports.getPrivacyAziende = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.render('coseLegali/legale', {
      pageTitle: 'Privacy Policy Aziende',
      autenticato: true,
    });
  } else {
    return res.render('coseLegali/legale', {
      pageTitle: 'Privacy Policy Aziende',
      autenticato: false,
    });
  }
}

/* regolamento controller */
exports.getRegolamento = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.render('coseLegali/legale', {
      pageTitle: 'Regolamento',
      autenticato: true,
    });
  } else {
    return res.render('coseLegali/legale', {
      pageTitle: 'Regolamento',
      autenticato: false,
    });
  }
}


exports.getIMieiSconti = (req, res, next) => {
  if (req.session.isLoggedIn) {
    req.user.notificaSconti = 0;
    req.user.save().then(result => {
      return req.user.populate('cart.items.productId').execPopulate()
        .then(user => {
          return res.render('singlepage/imieisconti', {
            pageTitle: 'I miei sconti',
            autenticato: true,
            user: req.user,
            urlEvento: req.query.urlEvento
          });
        })
    }).catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  } else {
    return res.render('singlepage/imieisconti', {
      pageTitle: 'I miei sconti',
      autenticato: false,
      urlEvento: req.query.urlEvento
    });
  }
}

exports.postMettiSconto = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToBought(product)
        .then(result => {
          return res.redirect('/imieisconti');
        })
    }).catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });;
}

exports.postTogliSconto = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromBought(prodId).then(result => {
    return res.redirect('/imieisconti');
  }).catch(err => {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}


/* decide quanto deve variare velocemente la barra
   il ritorno è la lunghezza della barra */
function get_bar_progress(remaining_time, total_time) {
  var passed_time = total_time * 3600000 - remaining_time // tempo passato in millisecondi

  var coefficients = [1 / 150,
  0.6 / 30,
  1.2 / 30,
  1.8 / 30,
  5.5 / 30,
  3.8 / 30,
  5.5 / 30,
  8.4 / 30,
  12.1 / 30,
  18 / 30,
  29 / 30]

  var progress_bar = ['5',  // % progresso barra, se tempo passato è < 1/150 del totale
    '10', // se tempo passato tra 1/150 e 0.6/30 del totale
    '20', // se tempo passato tra 0.6/30 e 1.2/30 del totale
    '30',
    '40',
    '50',
    '60',
    '71',
    '82',
    '92',
    '97', // se tempo passato tra 18/30 e 29/30 del totale
    '99'  // se tempo passato > 29/30 del totale
  ]

  for (i = 0; i < coefficients.length; i++) {
    if (i == 0 && passed_time < coefficients[0] * total_time * 3600000) {
      return progress_bar[0]
    } else if (i == coefficients.length - 1) {
      return progress_bar[coefficients.length - 1]
    } else if (passed_time > coefficients[i] * total_time * 3600000 &&
      passed_time < coefficients[i + 1] * total_time * 3600000) {
      return progress_bar[i]
    }
  }
}


//=================
// dhesio 2.0
//=================

exports.getEventiInfluencer = (req, res, next) => {

  const influencerNickname = req.params.influencer;
  const evento = req.params.evento;
  const urlPagina = 'eventi/' + influencerNickname + '/' + evento;
  const giaPartecipato = req.session.giaPartecipato;
  req.session.giaPartecipato = false;

  Product.find({ influencer: influencerNickname, evento: evento })
    .then(products => {
      const lotterieFinite = [], lotterieInCorso = [];
      var k;
      /* va ad aggiungere tutti i parametri che non sono già definiti nella lotteria nel database */
      for (k = 0; k < products.length; k++) {

        /* determina la lunghezza delle barre delle lotterie */
        products[k].barra = 50;

        /* verifica se la lotteria sia chiusa o no e la inserisce nel insieme corrispondente */
        if ((new Date(products[k].timeoutUtenti) - new Date((new Date()).getTime() + 3600000 * 2)) < 0) {
          products[k].chiusa = true;
          lotterieFinite.push(products[k]);
        } else {
          products[k].chiusa = false;
          lotterieInCorso.push(products[k]);
        }

      }
      if (req.session.isLoggedIn) {
        var i, j;
        for (i = 0; i < req.user.cart.items.length; i++) {
          for (j = 0; j < lotterieInCorso.length; j++) {
            if (req.user.cart.items[i].productId.toString() == lotterieInCorso[j]._id.toString()) {
              lotterieInCorso[j].joined = true;
            }
          }
        }

        return res.render('singlepage/index', {
          pageTitle: 'Dhesìo',
          user: req.user,
          autenticato: true,
          prodotti: lotterieInCorso,
          lotterieFinite: lotterieFinite,
          urlPagina: urlPagina,
          giaPartecipato: giaPartecipato
        });
      } else {
        /* se l'utente non è loggato */
        return res.render('singlepage/index', {
          pageTitle: 'Dhesìo',
          user: 'Accedi',
          autenticato: false,
          prodotti: lotterieInCorso,
          lotterieFinite: lotterieFinite,
          urlPagina: urlPagina
        });
      }



      /* se l'utente è loggato */

    }).catch(err => {
      console.log(error);
      const error = new Error(err);
      error.httpStatusCode = 500;

      return next(error);
    });
}


