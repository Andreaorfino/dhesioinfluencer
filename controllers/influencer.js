const bcrypt = require('bcryptjs');
var imgbbUploader = require('imgbb-uploader');
const nodemailer = require('nodemailer');


const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'help.dhesio@gmail.com',
    pass: ''
  }
});

const Influencer = require('../models/influencer');
const Collaborazione = require('../models/collaborazione');
const Fornitore = require('../models/fornitore');
const user = require('../models/user');
const fornitore = require('../models/fornitore');

exports.getRegistrazione = (req, res, next) => {
  res.render('influencer/registrazione', {
    pageTitle: 'Registrazione Influencer'
  });
}

exports.postRegistrazione = (req, res, next) => {
  //take all form input
  const nome = req.body.nome;
  const nicknameTikTok = req.body.nicknameTikTok.toLowerCase();
  const nicknameInstagram = req.body.nicknameInstagram.toLowerCase();
  const sesso = req.body.sesso;
  const eta = req.body.eta;/* 
  const marginLeft = req.body.marginleft;
  const marginTop = req.body.margintop; */
  const followers = req.body.followers;
  const interessiFollowers1 = req.body.fInteressi[0];
  const interessiFollowers2 = req.body.fInteressi[1];
  const etaFollowers1 = req.body.feta[0];
  const etaFollowers2 = req.body.feta[1];
  const password = req.body.password;
  const sessoFollowers = req.body.fsesso;
  const email = req.body.email;/* 
  const landscape = req.body.landscape;
  const image = req.file; */
  const numeroFollowersTiktok = req.body.followers;
  const numeroFollowersInstagram = req.body.followersI;


  //retrive from database the influencer
  return Influencer.findOne({ $or: [{ nicknameInstagram: nicknameInstagram }, { nicknameTikTok: nicknameTikTok }, { email: email }] })
    .then(influencer => {
      //if there is already a influencer redirect to sign up
      if (influencer) {
        if (!influencer.eliminato) {
          return res.render('influencer/registrazione', {
            nome: nome,
            nicknameTikTok: nicknameTikTok,
            nicknameInstagram: nicknameInstagram,
            sesso: sesso,
            eta: eta,
            followers: followers,
            finteressi1: interessiFollowers1,
            finteressi2: interessiFollowers2,
            feta1: etaFollowers1,
            feta2: etaFollowers2,
            fsesso: sessoFollowers,
            email: email,
            giaPresente: true,
            tab: 0,
            pageTitle: 'Registrazione',
            followersI: numeroFollowersInstagram,
            followers: numeroFollowersTiktok
          });
        }
      }


      //hash the password
      return bcrypt.hash(password, 12)
        .then(hashedPassword => {
          return Influencer.countDocuments({}, influencersNumber => {
            influencersNumber = influencersNumber ? influencersNumber : 0;
            //create influencer object
            const influencer = new Influencer({
              nicknameAccesso: nicknameTikTok,
              nicknameTikTok: nicknameTikTok,
              nicknameInstagram: nicknameInstagram,
              password: hashedPassword,
              niscrizione: influencersNumber,
              nome: nome,
              eta: eta,
              sesso: sesso,
              interessiFollowers1: interessiFollowers1,
              interessiFollowers2: interessiFollowers2,
              etaFollowers1: etaFollowers1,
              etaFollowers2: etaFollowers2,
              sessoFollowers: sessoFollowers,
              email: email,
              urlImage: '/images/profiloImg.png',
              landscape: 'landscape',
              like: 0,
              punteggio: 0,
              numeroFollowersTiktok: numeroFollowersTiktok,
              numeroFollowersInstagram: numeroFollowersInstagram
            })
            return influencer.save().then(influencer => {
              req.session.isLoggedIn = true;
              req.session.user = influencer;
              req.session.typeUser = "influencer";
              return res.redirect('/influencer/profilo');
            }).catch(err => {
              console.log(err);
              const error = new Error(err);
              error.httpStatusCode = 500;
              return next(error);
            });

            //load image and get url
            /*           setTimeout(function () {
                        return imgbbUploader("61751e97d08a35da657c9fcc67f20a1d", 'images/influencer/' + image.filename)
                          .then(response => {
                            //count influencer
                            .catch(err => {
                                console.log(err);
                                const error = new Error(err);
                                error.httpStatusCode = 500;
                                return next(error);
                              });
                            });
                          
                      }, 200);
                      */
          });
        })
    }).catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

}

//test
exports.getGeneraResetPassword = (req, res, next) => {
  let result = "risultato";
  let mailDetails = {
    from: 'help.dhesio@gmail.com',
    to: 'dhesio.official@gmail.com',
    subject: 'Test mail',
    text: '' + result + ''
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log('Error Occurs');
    } else {
      console.log('Email sent successfully');
    }
  });
  return res.send('ciao');
}

exports.postRecuperaPassword = (req, res, next) => {
  const email = req.body.email;

  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 20; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  console.log(result);


  return Influencer.findOne({ email: email })
    .then(influencer => {
      influencer.resetToken = result;
      return influencer.save()
        .then(() => {
          let mailDetails = {
            from: 'help.dhesio@gmail.com',
            to: email,
            subject: 'Test mail',
            text: 'Ecco il tuo link per resettare la passord: ' + result
          };

          mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
              console.log('Error Occurs');
            } else {
              res.redirect('/')
            }
          });
        });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getRecuperaPassword = (req, res, next) => {
  return res.render('singlepage/resetGenera', {
    pageTitle: 'Recupera Password'
  });
}


exports.getRegistrazioneCompletata = (req, res, next) => {
  Influencer.findOne({ nicknameTikTok: "adri.7m" }).then(influencer => {
    return res.render('influencer/registrazioneCompletata', {
      pageTitle: 'Registrazione completata',
      influencer: influencer
    })
  }).catch(err => {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });

}

exports.getAccedi = (req, res, next) => {

  if (req.user) {
    return res.redirect('/influencer/profilo');
  }

  return res.render('influencer/accedi', {
    pageTitle: 'Accedi'
  });
}

exports.postAccedi = (req, res, next) => {

  const nickname = req.body.nickname.toLowerCase().replace(/\s/g, '').replace(/@/g, '');;
  const password = req.body.password;
  console.log(nickname, password);

  Influencer.findOne({ nicknameAccesso: nickname }).then((influencer) => {

    if (!influencer || influencer.eliminato) {
      /* se non si ha l'id instagram inserito nel database si ritorna l'errore */
      return res.status(422).render('influencer/accedi', {
        pageTitle: 'Accedi',
        error: true,
        nickname: nickname,
      });
    }

    return bcrypt
      .compare(password, influencer.password)
      .then(doMatch => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = influencer;
          req.session.typeUser = "influencer";
          return res.redirect('/influencer/profilo');
        } else {
          return res.status(422).render('influencer/accedi', {
            pageTitle: 'Accedi',
            error: true,
            nickname: nickname,
          });
        }
      })

  })

}


exports.getProfilo = (req, res, next) => {
  Fornitore.find({}).select({ "nome": 1, "_id": 0 })
    .then(fornitori => {
      Collaborazione.find({ autore: req.user })
        .populate('autore')
        .populate('fornitore')
        .then(collaborazioni => {
          let numeroLike = 0;
          collaborazioni.forEach(collaborazione => {
            numeroLike += collaborazione.likes.length;
          })
          user.like = numeroLike;
          return res.render('influencer/profilo', {
            user: req.user,
            influencer: req.user,
            pageTitle: 'Profilo',
            collaborazioni: collaborazioni,
            fornitori: fornitori,
            aperta: false
          });
        })
    }).catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.getProfiloAltro = (req, res, next) => {
  if (req.session.isLoggedIn) {
    if (req.user.nicknameAccesso == req.params.nickname) return res.redirect('/influencer/profilo');
  }

  Influencer.findOne({ nicknameAccesso: req.params.nickname })
    .then(influencer => {
      Collaborazione.find({ autore: influencer })
        .populate('autore')
        .populate('fornitore')
        .then(collaborazioni => {
          let numeroLike = 0;
          collaborazioni.forEach(collaborazione => {
            numeroLike += collaborazione.likes.length;
          })
          influencer.like = numeroLike;
          if (req.session.isLoggedIn) {
            return res.render('influencer/profilo', {
              user: req.user,
              pageTitle: influencer.nicknameAccesso,
              collaborazioni: collaborazioni,
              aperta: false,
              isAuthenticated: true,
              influencer: influencer
            });
          } else {
            return res.render('influencer/profilo', {
              influencer: influencer,
              pageTitle: influencer.nicknameAccesso,
              collaborazioni: collaborazioni,
              aperta: false,
              isAuthenticated: false,
            });
          }
        })
    }).catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.getModificaCollab = (req, res, next) => {
  Fornitore.find({}).select({ "nome": 1, "_id": 0 })
    .then(fornitori => {
      Collaborazione.find({ autore: req.user })
        .populate('autore')
        .populate('fornitore')
        .then(collaborazioni => {
          Collaborazione.findById(req.params.collaborazioneId)
            .populate('fornitore')
            .then(collaborazione => {
              let numeroLike = 0;
              collaborazioni.forEach(collaborazione => {
                numeroLike += collaborazione.likes.length;
              })
              user.like = numeroLike;
              return res.render('influencer/profilo', {
                influencer: req.user,
                pageTitle: 'Profilo',
                collaborazioni: collaborazioni,
                fornitori: fornitori,
                aperta: true,
                modCollab: collaborazione,
                user: req.user
              });
            })

        })
    }).catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}


exports.postAggiornaProfilo = (req, res, next) => {
  if (req.body.ciStaImmagine == 'true') {
    const landscape = req.body.landscape;
    const image = req.file;
    setTimeout(function () {
      return imgbbUploader("61751e97d08a35da657c9fcc67f20a1d", 'images/influencer/' + image.filename)
        .then(response => {
          req.user.descrizione = req.body.bio;
          req.user.numeroFollowersInstagram = req.body.followersInstagram;
          req.user.numeroFollowersTiktok = req.body.followersTikTok;
          req.user.urlImage = response.display_url;
          req.user.landscape = landscape;
          req.user.save().then(() => { return res.redirect('/influencer/profilo'); });
        })
    });
  } else {
    req.user.descrizione = req.body.bio;
    req.user.numeroFollowersInstagram = req.body.followersInstagram;
    req.user.numeroFollowersTiktok = req.body.followersTikTok;
    req.user.save().then(() => { return res.redirect('/influencer/profilo'); });
  }
}

exports.postCancella = (req, res, next) => {
  const utente = req.user
  req.session.destroy(err => {
    return Influencer.findById(utente._id)
      .then(influencer => {
        influencer.eliminato = true;
        influencer.save().then(() => {
          return res.render('singlepage/cancellazione', {
            path: '/cancellazione',
            pageTitle: 'Account eliminato',
            user: utente.nome
          });
        })

      }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  })
};

exports.getAggiorna = (req, res, next) => {
  Influencer.find().then(influencers => {
    const collaborazioniQuery = [];
    influencers.forEach(influencer => {
      collaborazioniQuery.push(Collaborazione.find({ autore: influencer })
        .then(collab => {
          return { collaborazioni: collab, influencer: influencer }
        }));
    });

    Promise.all(collaborazioniQuery).then(tutto => {
      const savePromise = [];


      tutto.forEach(coppia => {
        coppia.collaborazioni.forEach(collaborazione => {
          if (!coppia.influencer.collaborazioni.includes(collaborazione._id.toString())) {
            console.log(collaborazione.titolo, '-----', coppia.influencer.nome)
            coppia.influencer.collaborazioni.push(collaborazione);
          }
        });
        savePromise.push(coppia.influencer.save());
      });

      Promise.all(savePromise).then(() => {
        res.send('fatto');
      })


    })

  })
}

exports.getLikegiusti = (req, res, next) => {
  Influencer.find()
    .populate('collaborazioni').then(influencers => {
      const query = [];
      influencers.forEach(influencer => {
        let totaleLike = 0;
        influencer.collaborazioni.forEach(collaborazione => {
          totaleLike += collaborazione.nLike || 0;
        });
        console.log(influencer.nicknameAccesso, '----', totaleLike);
        influencer.nLike = totaleLike;
        query.push(influencer.save());
      })

      Promise.all(query).then(() => { res.send('ok') });
    })
}

exports.getLikegiustiFornitori = (req, res, next) => {
  Fornitore.find({}).then(fornitori => {
    const query1 = [];
    fornitori.forEach(fornitore => {
      query1.push(Collaborazione.find({ fornitore: fornitore._id })
        .then(collaborazioni => { return { collaborazioni: collaborazioni, fornitore: fornitore } }));
    })
    Promise.all(query1).then(K => {
      const query2 = [];
      K.forEach(k => {
        k.collaborazioni.forEach(collaborazione => {
          console.log(k.fornitore.nome, '----', collaborazione.titolo)
          k.fornitore.collaborazioni.push(collaborazione);
        });
        query2.push(k.fornitore.save());
      })

      Promise.all(query2).then(() => {
        res.send('ok?')
      })
    })
  })
}

exports.getCancellaCollaborazioni = (req, res, next) => {
  Fornitore.find({}).then(fornitori => {
    const query = [];
    fornitori.forEach(fornitore => {
      fornitore.collaborazioni = [];
      query.push(fornitore.save());
    });
    Promise.all(query).then(() => { res.send('uhmmmmm') })
  })
}

exports.getAggiornaLikeEStelle = (req, res, next) => {
  Fornitore.find({}).populate('collaborazioni').then(fornitori => {
    const query = [];
    fornitori.forEach(fornitore => {
      let numeroStelle = 0;
      fornitore.collaborazioni.forEach(collaborazione => {
        numeroStelle += parseInt(collaborazione.stelle);
      })
      fornitore.rating = `${numeroStelle}`;
      query.push(fornitore.save());
    });
    Promise.all(query).then(() => { res.send('fatto'); })
  })
}