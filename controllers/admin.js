const mongoose = require('mongoose');

const { validationResult } = require('express-validator/check');

const Product = require('../models/product');
const User = require('../models/user');
const Periodo = require('../models/periodo');
const Fornitore = require('../models/fornitore');

const fornitoreFolder = './images/singlepage/P';
const frasetteFolder = './images/singlepage/F';
const valoriFolder = './images/singlepage/C';
const fs = require('fs');



exports.getUppolo = (req, res, next) => {
  return res.render('singlepage/imgup', {
    path: '/admin/uppolo',
    pageTitle: 'Uppolo',
    fatto: ''
  });
};

exports.postUppolo = (req, res, next) => {
  const image = req.file;

  return res.render('singlepage/imgup', {
    path: '/admin/uppolo',
    pageTitle: 'Uppolo',
    fatto: "Fattooooo",
    immagine: image.filename
  });

};

exports.getUppoloLotteria = (req, res, next) => {

  const frasette = [];
  fs.readdirSync(frasetteFolder).forEach(file => {
    frasette.push(file.substring(2, file.length - 4))
  });

  const valori = [];
  fs.readdirSync(valoriFolder).forEach(file => {
    valori.push(file.replace(/^\D+|\D+$/g, ""));
  });


  Periodo.find().then(periodi => {
    return Fornitore.find()
      .then(fornitori => {

        return res.render('singlepage/lotteriaup', {
          path: '/admin/uppoloProdotto',
          pageTitle: 'Inserisci Lotteria',
          fatto: '',
          fornitori: fornitori,
          frasette: frasette,
          valori: valori,
          periodi: periodi
        });
      });
  })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });






};

exports.postUppoloLotteria = (req, res, next) => {
  const valore = req.body.Valore;
  const visibile = req.body.visibile;
  const visibileOra = req.body.visibileOra;
  const timeout = req.body.timeout;
  const timeoutOra = req.body.timeoutOra;
  const timeoutNostro = req.body.timeoutNostro;
  const timeoutNostroOra = req.body.timeoutNostroOra;
  const timeoutUtenti = req.body.timeoutUtenti;
  const timeoutUtentiOra = req.body.timeoutUtentiOra;
  const totaleOre = req.body.totaleOre;
  const fornitore = req.body.fornitore;
  const frase = req.body.frase;
  const fraseimmagine = req.body.fraseimmagine;
  const periodoId = req.body.periodo;
  const tipoLotteria = req.body.tipoLotteria;
  const linkLotteria = req.body.urlLink;

  const frasette = [];
  fs.readdirSync(frasetteFolder).forEach(file => {
    frasette.push(file.substring(2, file.length - 4))
  });

  const valori = [];
  fs.readdirSync(valoriFolder).forEach(file => {
    valori.push(file.replace(/^\D+|\D+$/g, ""));
  });

  Periodo.findById(periodoId).then(periodo => {
    return Periodo.find().then(periodi => {
      return Fornitore.findById(fornitore)
        .then(fornitoreOb => {

          const lotteria = new Product({
            valore: valore,
            visibile: visibile + 'T' + visibileOra,
            timeout: timeout + 'T' + timeoutOra,
            timeoutUtenti: timeoutUtenti + 'T' + timeoutUtentiOra,
            totaleOre: totaleOre,
            fornitore: fornitoreOb.nome,
            via: fornitoreOb.via,
            zona: fornitoreOb.zona,
            sito: fornitoreOb.sito,
            prodottoFisico: '-',
            descrizionesopra: '-',
            descrizionesopra2: '-',
            descrizionesotto: '-',
            frase1: frase,
            fraseimg1: fraseimmagine,
            iscritti: { items: [], },
            buoniSconto: { items: [] },
            sesso: 'MF',
            vincitore: '-',
            imageUrl: linkLotteria,
            imageProduttore: '-',
            hasCoccarda: '-',
            instagramid: '-',
            difficolta: 0,
            periodo: periodo,
            tipoLotteria: tipoLotteria,
            nome: '-',
            sottotitolo: '-'
          });

          return Fornitore.find()
            .then(fornitori => {
              return lotteria.save().then(result => {
                lotteria.joined = true;
                return res.render('singlepage/lotteriaup', {
                  path: '/admin/uppoloProdotto',
                  pageTitle: 'Inserisci Lotteria',
                  fatto: "Fattooooo",
                  prodotto: lotteria,
                  autenticato: true,
                  fornitori: fornitori,
                  frasette: frasette,
                  valori: valori,
                  user: req.session.user,
                  periodi: periodi
                });
              })
            })
        });
    })
  }).catch(err => {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};




exports.getUtenti = (req, res, next) => {
  const prodId = req.params.productId;

  /* prende la db la lotteria corrispondente */
  Product.findById(prodId)
    .then(prodotto => {
      prodotto.populate('iscritti.items.userId').execPopulate()
        .then(utenti => {
          return res.render('singlepage/utenti.ejs', {
            path: '/admin/uppolo',
            pageTitle: 'utenti',
            fatto: '',
            utenti: utenti.iscritti.items,
            lotteriaId: prodId
          });
        })
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });


};

exports.postEccoVincitore = (req, res, next) => {
  const prodId = req.body.lotteriaId;
  const vincitore = req.body.nickname;
  const nIscrizione = req.body.nIscrizione;

  /* prende la db la lotteria corrispondente */
  Product.findById(prodId)
    .then(prodotto => {
      prodotto.instagramid = vincitore;
      if (nIscrizione < 1000) {
        prodotto.hasCoccarda = 1;
      }
      return prodotto.save().then(result => {
        return res.redirect('/');
      })
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });;
};

exports.getEliminaLotteria = (req, res, next) => {
  const prodId = req.params.productId;

  /* prende la db la lotteria corrispondente */
  Product.findByIdAndRemove(prodId)
    .then(prodotto => {
      return res.redirect('/');
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });;
};

exports.postPeriodo = (req, res, next) => {
  const inizio = new Date(req.body.inizio + 'T' + req.body.inizioOra).getTime();
  const fine = new Date(req.body.fine + 'T' + req.body.fineOra).getTime();
  const numeroLotterie = req.body.numeroLotterie;

  const periodo = new Periodo({
    inizio: inizio,
    fine: fine,
    numeroLotterie: numeroLotterie
  });


  return periodo.save().then(result => {
    periodo.fine = req.body.fine + 'T' + req.body.fineOra;
    periodo.inizio = req.body.inizio + 'T' + req.body.inizioOra;
    return res.render('singlepage/periodo', {
      path: '/admin/periodo',
      pageTitle: 'Periodo',
      fatto: "Fattooooo",
      autenticato: true,
      user: req.session.user,
      periodo: periodo
    });
  }).catch(err => {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });

};

exports.getPeriodo = (req, res, next) => {
  return res.render('singlepage/periodo', {
    path: '/admin/periodo',
    pageTitle: 'Periodo',
    fatto: "",
    autenticato: true,
    user: req.session.user
  });
  /* prende la db la lotteria corrispondente */
};


exports.p = (req, res, next) => {
  const fornitore = new Fornitore({
    nome: 'feleppaofficial',
    zona: 'Francesca e Veronica Feleppa. Un duo fashion complementare e inscindibile, dal cui estro nascono creazioni di tendenza, uniche, dall’impronta riconoscibile e distintiva. ',
    via: ' ',
    sito: 'www.feleppa.com'
  });
  return fornitore.save()
    .then(result => {
      return res.redirect('/');
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};



exports.getFidelity = (req, res, next) => {
  User.find().then(utenti => {
    const fidel = []
    for (let i = 0; i < utenti.length; i++) {
      var cont = 0;
      var pred = ""
      console.log(utenti[i].cart.items[0])
      for (let j = 0; j < utenti[i].cart.items; j++) {
        console.log(utenti[i].cart.items[j].productId)
        if (pred != utenti[i].cart.items[j].productId)
          cont++
      }

      if (cont > 1) fidel.push(utenti[i].nickname)
    }
    return res.send(fidel)
  })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  /* prende la db la lotteria corrispondente */
};

exports.getVisual = (req, res, next) => {
  User.find().then(utenti => {
    return Product.find().then(lotterie => {
      const utentiPulito = [];
      const lotteriePulite = [];

      return res.render('singlepage/recap', {
        utenti: utenti,
        lotterie: lotterie,
        path: '/admin/periodo',
        pageTitle: 'Periodo',
        autenticato: true,
        user: req.session.user,
      })
    })


  })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  /* prende la db la lotteria corrispondente */
};


exports.getGeneraResetPassword = (req, res, next) => {

  return res.render('singlepage/resetGenera', {
    path: '/resetGenera',
    pageTitle: 'Genera reset',
    token: ''
  });


};

exports.postGeneraResetPassword = (req, res, next) => {
  const nickname = req.body.nickname;

  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 20; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }


  return User.findOne({ nickname: nickname })
    .then(user => {
      user.resetToken = result;
      return user.save()
        .then(res1 => {
          return res.render('singlepage/resetGenera', {
            path: '/resetGenera',
            pageTitle: 'Genera reset',
            token: result
          });
        });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
