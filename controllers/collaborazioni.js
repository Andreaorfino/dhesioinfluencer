const Influencer = require('../models/influencer');
const Collaborazione = require('../models/collaborazione');
const Fornitore = require('../models/fornitore');

var profiliAdmin = ['goku', 'andrea'];

exports.postMettiRecensione = (req, res, next) => {
    const fornitoreNome = req.body.fornitore.replace(/^./, req.body.fornitore[0].toUpperCase()).trim();
    let collaborazione = new Collaborazione({
        titolo: req.body.titolo,
        cosaFatto: req.body.cosaFatto,
        recensione: req.body.recensione,
        stelle: req.body.stelle,
        autore: req.user._id,
        data: req.body.data,
        social: `${req.body.tiktok} ${req.body.instagram}`,
        fornitore: "",
        nLike: 0,
        creazioneData: new Date().getTime(),
        mipiace: [],
        nonmipiace: [],
        commenti: []
    });

    profiliAdmin.forEach( nickname => { if (nickname == req.user.nicknameAccesso) collaborazione.nonVisibile = true; });

    Collaborazione.findOne({ recensione: collaborazione.recensione, cosaFatto : collaborazione.cosaFatto }).then( collaborazioneCerca => {
        if(collaborazioneCerca) return res.redirect('/influencer/profilo');

        return Fornitore.findOne({ nome: fornitoreNome })
        .then(fornitore => {

            if (fornitore) {
                collaborazione.fornitore = fornitore._id;
                if (fornitore.rating == '') { fornitore.rating = '0' }
                fornitore.rating = parseInt(fornitore.rating) + parseInt(req.body.stelle);
                return collaborazione.save()
                    .then(collaborazioneSaved => {
                        
                        fornitore.collaborazioni.push(collaborazioneSaved);
                        req.user.collaborazioni.push(collaborazioneSaved);
                        Promise.all([fornitore.save(), req.user.save()])
                            .then(() => {
                return res.redirect('/influencer/profilo');
                            });
                    })
            } else {
                const fornitore = new Fornitore({
                    nome: fornitoreNome,
                    rating: req.body.stelle,
                    collaborazioni: []
                })
                return fornitore.save()
                    .then(fornitoreSaved => {
                        collaborazione.fornitore = fornitoreSaved._id;
                        return collaborazione.save()
                            .then(collaborazioneSaved => {
                                fornitoreSaved.collaborazioni.push(collaborazioneSaved);
                                req.user.collaborazioni.push(collaborazioneSaved);
                                Promise.all([fornitoreSaved.save(), req.user.save()])
                                    .then(() => {
                                        return res.redirect('/influencer/profilo');
                                    });
                            })
                    })

            }
        })

    })
.catch(err => {
            console.log(err);
            return res.redirect('/influencer/profilo');
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.postAggiornaRecensione = (req, res, next) => {
    const fornitoreNome = req.body.fornitore.replace(/^./, req.body.fornitore[0].toUpperCase()).trim();
    Collaborazione.findById(req.body.collaborazioneId)
        .populate('fornitore')
        .then((collaborazione) => {


            let fornitore = collaborazione.fornitore;
            fornitore.rating = parseInt(fornitore.rating) - parseInt(collaborazione.stelle);

            for (let i = 0; i < fornitore.collaborazioni.length; i++) {
                const element = fornitore.collaborazioni[i];
                if (element == req.body.collaborazioneId) {
                    fornitore.collaborazioni.splice(i, 1);
                    break;
                }
            }


            fornitore.save().then(() => {

                collaborazione.titolo = req.body.titolo;
                collaborazione.cosaFatto = req.body.cosaFatto;
                collaborazione.recensione = req.body.recensione;
                collaborazione.stelle = req.body.stelle;
                collaborazione.data = req.body.data;
                collaborazione.social = `${req.body.tiktok} ${req.body.instagram}`;

                Fornitore.findOne({ nome: fornitoreNome })
                    .then(fornitore => {
                        if (fornitore) {
                            collaborazione.fornitore = fornitore._id;
                            fornitore.rating = parseInt(fornitore.rating) + parseInt(req.body.stelle);


                            return collaborazione.save()
                                .then(collaborazioneSaved => {
                                    fornitore.collaborazioni.push(collaborazioneSaved);
                                    return fornitore.save()
                                        .then(() => {
                                            return res.redirect('/influencer/profilo');
                                        });
                                })
                        } else {
                            const fornitore = new Fornitore({
                                nome: fornitoreNome,
                                rating: req.body.stelle,
                                collaborazioni: []
                            })
                            return fornitore.save()
                                .then(fornitoreSaved => {
                                    collaborazione.fornitore = fornitoreSaved._id;
                                    return collaborazione.save()
                                        .then(collaborazioneSaved => {
                                            fornitoreSaved.collaborazioni.push(collaborazioneSaved);
                                            fornitoreSaved.save()
                                                .then(() => {
                                                    return res.redirect('/influencer/profilo');
                                                });
                                        })
                                })

                        }
                    })
            })
        }).catch(err => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.postLike = (req, res, next) => {
    Collaborazione.findById(req.body.collaborazione)
        .populate('autore')
        .then(collaborazione => {
            //messo like

            if(!req.user.likes.includes(collaborazione._id)){

            collaborazione.likes.push(req.user);
            req.user.likes.push(collaborazione);

            collaborazione.autore.nLike = collaborazione.autore.nLike ? collaborazione.autore.nLike + 1 : 1;
            collaborazione.nLike = collaborazione.nLike ? collaborazione.nLike + 1 : 1;

            Promise.all([req.user.save(), collaborazione.save(), collaborazione.autore.save()])
                .then(() => {
                    res.send('like');
                });

            } else {

                //tolto like
                for (let i = 0; i < req.user.likes.length; i++) {
                    const element = req.user.likes[i];
                    if (element == collaborazione._id.toString()) {
                        req.user.likes.splice(i, 1);
                        break;
                    }
                }
                for (let i = 0; i < collaborazione.likes.length; i++) {
                    const element = collaborazione.likes[i];
                    if (element == req.user._id.toString()) {
                        collaborazione.likes.splice(i, 1);
                        break;
                    }
                }


            collaborazione.autore.nLike = collaborazione.autore.nLike ? collaborazione.autore.nLike - 1 : 0;
            collaborazione.nLike = collaborazione.nLike ? collaborazione.nLike - 1 : 0;

                Promise.all([req.user.save(), collaborazione.save(),collaborazione.autore.save()])
                .then(() => {
                    res.send('nolike');
                });

            }
        }).catch(err => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })

}