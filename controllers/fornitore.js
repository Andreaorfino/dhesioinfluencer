const Influencer = require('../models/influencer');
const Collaborazione = require('../models/collaborazione');
const Fornitore = require('../models/fornitore');
const PropostaCollaborazione = require('../models/propostaCollaborazione');
const Consigli = require('../models/consigli');
const ListaAttesa = require('../models/listaAttesa');
const Logs = require('../models/logs');
const nodemailer = require('nodemailer');

const mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'influencerdhesio@gmail.com',
        pass: ''
    }
});

exports.getAziende = (req, res, next) => {
    Fornitore.find().sort({ nome: 1 })
        .then((fornitori) => {
            if (req.session.isLoggedIn) {
                res.render('fornitori/aziende', {
                    pageTitle: 'Aziende',
                    fornitori: fornitori,
                    isAuthenticated: true,
                    user: req.user
                });
            } else {
                res.render('fornitori/aziende', {
                    pageTitle: 'Aziende',
                    isAuthenticated: false,
                    fornitori: fornitori
                });
            }
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            console.log(error);
            return next(error);
        });
}

exports.getAzienda = (req, res, next) => {
    Fornitore.findOne({ nome: req.params.nome })
        .then(fornitore => {
            Collaborazione.find({ fornitore: fornitore })
                .populate('autore')
                .sort({ nLike: -1 })
                .then(collaborazioni => {
                    if (req.session.isLoggedIn) {
                        res.render('fornitori/azienda', {
                            pageTitle: fornitore.nome,
                            fornitore: fornitore,
                            collaborazioni: collaborazioni,
                            isAuthenticated: true,
                            user: req.user
                        });
                    } else {
                        res.render('fornitori/azienda', {
                            isAuthenticated: false,
                            pageTitle: fornitore.nome,
                            fornitore: fornitore,
                            collaborazioni: collaborazioni
                        });
                    }
                })
        })

        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            console.log(error);
            return next(error);
        });
}

exports.getFormAzienda = (req, res, next) => {
    Fornitore.find({}).select({ "nome": 1, "_id": 0 }).then(fornitori => {
        res.render('fornitori/formFornitori', {
            pageTitle: 'Proposta Collab',
            fornitori: fornitori
        });
    })

}

exports.postFormAzienda = (req, res, next) => {
    try {
        propostaCollaborazione = new PropostaCollaborazione({
            titolo: req.body.titolo,
            descrizione: req.body.descrizione,
            fornitore: req.body.fornitore.replace(/^./, req.body.fornitore[0].toUpperCase()).trim(),
            visibile: false
        });
        PropostaCollaborazione.findOne({ titolo: req.body.titolo, descrizione: req.body.descrizione }).then(result => {
            if (result) {
                Fornitore.find({}).select({ "nome": 1, "_id": 0 }).then(fornitori => {
                    res.render('fornitori/formFornitori', {
                        pageTitle: 'Proposta Collab',
                        fornitori: fornitori,
                        inserita: true,
                        propostaCollaborazione: propostaCollaborazione
                    });
                })
            } else {
                propostaCollaborazione.dataCreazione = new Date()
                propostaCollaborazione.save().then(() => {
                    Fornitore.find({}).select({ "nome": 1, "_id": 0 }).then(fornitori => {
                        res.render('fornitori/formFornitori', {
                            pageTitle: 'Proposta Collab',
                            fornitori: fornitori,
                            inserita: true,
                            propostaCollaborazione: propostaCollaborazione
                        });
                    })
                })
            }
        })
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        console.log(error);
        return next(error);
    }
}

exports.getProposteCollaborazioni = (req, res, next) => {
    PropostaCollaborazione.find({}).then(proposteCollaborazione => {
        if (req.session.isLoggedIn) {
            res.render('fornitori/proposteLista', {
                pageTitle: 'proposte Collab',
                proposteCollaborazione: proposteCollaborazione,
                isAuthenticated: true,
                user: req.user
            });
        } else {
            res.render('fornitori/proposteLista', {
                isAuthenticated: false,
                pageTitle: 'proposte Collab',
                proposteCollaborazione: proposteCollaborazione,
            });
        }
    })
}

exports.postSvela = (req, res, next) => {
    PropostaCollaborazione.findById(req.body.idProposta).then(propostaCollaborazione => {
        propostaCollaborazione.visibile = !propostaCollaborazione.visibile;
        propostaCollaborazione.save().then(() => { res.redirect('/aziende/proposteCollab') });
    })
}

exports.getLandingPage = (req, res, next) => {
    res.render('fornitori/landingPage', {
        pageTitle: 'Dhesio Influencer'
    });
}

exports.getInArrivo = (req, res, next) => {
    res.render('fornitori/staArrivando', {
        pageTitle: 'Dhesio Influencer'
    });
}

exports.getIscritto = (req, res, next) => {
    /*     let consiglio = new Consigli({
            titolo: "titoletto",
            data: '10 Nov',
            testo: 'il trucco per fare i soldi e stamparli... ah dopo le 6 niente carboidrati',
            pubblicato: 'Pubblicato il 5 Novembre alle 14.00'
        })
        consiglio.save().then(() =>{  */

    console.log(req.headers.host);
    Consigli.find({}).then(consigli => {
        res.render('fornitori/iscritto', {
            pageTitle: 'Dhesio Influencer',
            consigli: consigli
        });
    })
}

exports.getIscrittoBeta = (req, res, next) => {
    /*     let consiglio = new Consigli({
            titolo: "titoletto",
            data: '10 Nov',
            testo: 'il trucco per fare i soldi e stamparli... ah dopo le 6 niente carboidrati',
            pubblicato: 'Pubblicato il 5 Novembre alle 14.00'
        })
        consiglio.save().then(() =>{  */


    Consigli.find({}).then(consigli => {
        res.render('fornitori/iscrittoBeta', {
            pageTitle: 'Dhesio Influencer',
            consigli: consigli
        });
    })
}

exports.postIscritto = async (req, res, next) => {
    let nuovo = new ListaAttesa({
        nome: req.body.nome,
        nomeAzienda: req.body.nomeAzienda,
        email: req.body.email
    })

    let mailDetails = {
        from: 'help.dhesio@gmail.com',
        to: nuovo.email,
        subject: `Benvenuto ${nuovo.nome}`,
        html: `<!DOCTYPE html>
        <html>
        
        <head>
            <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@200;300;400;500;600;700&display=swap"
                rel="stylesheet">
        </head>
        
        <body>
        
            <style>
                .body {
                    font-family: Josefin Sans;
                    color: #274674;
                }
        
                .grid_grande {
                    margin: 20px
                }
        
                @media screen and (min-width: 400px) {
                    .grid_grande {
                        display: grid;
                        grid-template-columns: 1fr 400px 1fr
                    }
        
                }
        
                .titolo {
                    font-size: 20px;
                }



            </style>
            <div class="grid_grande">
                <div></div>
                <div>
                <div style="margin:30px"></div>
                <div style="font-size: 30px;text-align:center"><span style="color:#FF9052"><img src="https://www.dhesioinfluencer.com/images/singlepage/logo.png" style="width:50px"> &nbsp;Dhesìo</span> <span
                        style="color: #274674;">Influencer</span></div>
                        <div style="margin:30px"></div>
                        
                        <div style="margin:5px 5%"> 
                    <table style="width:100% ;border-spacing: 10px; padding:5px;" >

                        <tr>
                            <td style="width:100%;vertical-align: top;">
                            <div style="font-size:14px; ">

                            

                            <span style="font-size:20px">Ciao ${nuovo.nome}, <b>Benvenuto!</b> </span>

                            <br><br>

                            Stiamo lavorando duramente per rivoluzionare il rapporto tra Aziende e Influencer
                            <div style="margin:18px"></div>
                            con l'obiettivo di <b>massimizzarne l'efficacia</b>
                            e <b>ridurre tempi e costi di ricerca</b> dell'Influencer adatto.
                            <div style="margin:18px"></div>
                            <b>Come?</b>
                            <div style="margin:18px"></div>
                            Lo scopriremo insieme <b>il 10 Dicembre!</b>
                            <div style="margin:18px"></div>
                            Ti manderemo <b>una mail a settimana di recap</b> (no spam) in cui potrai essere aggiornato sullo lo stato di avanzamento dei lavori :)
                            </div>
                            </td>
                            
                        </tr>
        
                    </table>

                    <div style="margin:10px;"></div>

                    <table style="width:100%; border-spacing: 10px; padding:5px;" >

                        <tr>
                            <td style="width:100%;vertical-align: top;">
                            <div style="font-size:14px;">

                            
                            Nel frattempo, pubblicheremo ogni <b>Mar - Gio - Sab</b> contenuti relativi all'<b>Influencer Marketing (IM)</b> nei quali forniremo spunti interessanti e consigli pratici.
                            <div style="margin:18px"></div>
                            In più <b>ogni domenica</b> pubblicheremo un video dove <b>sintetizzeremo gli argomenti trattati</b> durante la settimana e <b>racconteremo</b> il nostro viaggio.
                            <div style="margin:18px"></div>

                            <b>I contenuti saranno raccolti all'interno del nostro sito</b>
                            <a href="dhesioinfluencer.com/aziende/dhesioinfluencer" style="color: #274674;">Dhesioinfluencer.com</a>
                            in maniera completa e ordinata,
                            ma saranno <b>comunque accessibili<b> anche dai nostri canali:
                            

                            <ol>
                                <li><b>Instagram</b></li>
                                <li><b>YouTube</b></li>
                                <li><b>Facebook</b></li>
                            <ol>
                            </div>
                            </td>
                            
                        </tr>
        
                    </table>

                    <div style="margin:8px;"></div>

                    <table style="width:100%; border-spacing: 10px; padding:5px;" >

                        <tr>
                            <td style="width:100%;vertical-align: top;">
                            <div style="font-size:14px; ">

                            
                            Hai già collaborato con Influencer? <b>Hai riscontrato qualche tipo di problema?</b>
                            <div style="margin:18px"></div>

                            Ci piacerebbe che ce lo raccontassi per capire come possiamo risolverli!<br><b>Rispondi a questa mail per facerlo sapere</b>
                            <div style="margin:18px"></div>

                            
                            <div style="margin:18px"></div>

                            Buona giornata!
                            
                            </div>
                            </td>
                            
                        </tr>
        
                    </table>

                            <div style="margin:30px"></div>

                        <div style="text-align:center">


                            <a href="https://instagram.com/dhesioinfluencer">
                            <img src="dhesioinfluencer.com/images/instagramBlu.png" style="width:35px"></a>&nbsp;&nbsp;

                            <a href="https://www.youtube.com/channel/UCB00kViN2jJNbK2ctM-ts2w">
                            <img src="dhesioinfluencer.com/images/youtubeBlu.png" style="width:35px"></a>&nbsp;&nbsp;

                            <a href="https://www.facebook.com/dhesioinfluencer">
                            <img src="dhesioinfluencer.com/images/facebookBlu.png" style="width:35px"></a>
                        </div>

                            <div style="margin:30px"></div>
                                

                    <div style=" text-align:center;">
                        
                        <a href="dhesioinfluencer.com/privacyazienda">privacy policy</a>
                --
                        <i>DhesioInfluencer, Roma 00142, ROMA (RM)</i>
                    </div>

                    </div>


                </div>
                <div></div>
            </div>
        </body>
        
        </html>`
    };

    await mailTransporter.sendMail(mailDetails, async function (err, data) {
        if (err) {
            console.log('Error Occurs' + nuovo.email);
            console.log(err);
        } else {
            console.log('Email sent successfully to ' + nuovo.email);
        }
    });

    nuovo.save().then(() => {
        res.redirect('/aziende/dhesioInfluencer')
    })
}

exports.postEvento = async (req, res, next) => {

    let params = {};
    for (let key in req.body) {
        if (key == '_csrf' || key == 'data') continue;
        params[key] = req.body[key];
    }

    const log = new Logs({
        tipo: 'event',
        data: req.body.data,
        params: params
    })

    try {
        await log.save();
        res.send('');
    } catch (err) {
        console.log(err);
        res.send('');
    }


}

exports.postArrivo = async (req, res, next) => {
    let params = {};
    for (let key in req.body) {
        if (key == '_csrf' || key == 'data') continue;
        params[key] = req.body[key];
    }

    const log = new Logs({
        tipo: 'land',
        data: req.body.data,
        params: params
    })

    try {
        await log.save();
        res.send('');
    } catch (err) {
        console.log(err);
        res.send('');
    }
}

exports.getMandaMail = async (req, res, next) => {
    const nmail = req.params.nmail;
    let listaAttesa = await ListaAttesa.find({});

    //toglie le mail che hanno già ricevuto 
    listaAttesa = listaAttesa.filter(item => {
        return (item.nmail === undefined || item.nmail < nmail) && !item.nonMandare;
    });

    listaAttesa.forEach(item => {

        let mailDetails = {
            from: 'help.dhesio@gmail.com',
            to: item.email,
            subject: `Benvenuto16 ${item.nome}`,
            html: `<!DOCTYPE html>
            <html>
            
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@200;300;400;500;600;700&display=swap"
                    rel="stylesheet">
            </head>
            
            <body>
            
                <style>
                    .body {
                        font-family: Josefin Sans;
                        color: #274674;
                    }
            
                    .grid_grande {
                        margin: 20px
                    }
            
                    @media screen and (min-width: 400px) {
                        .grid_grande {
                            display: grid;
                            grid-template-columns: 1fr 400px 1fr
                        }
            
                    }
            
                    .titolo {
                        font-size: 20px;
                    }



                </style>
                <div class="grid_grande">
                    <div></div>
                    <div>
                    <div style="margin:30px"></div>
                    <div style="font-size: 30px;text-align:center"><span style="color:#FF9052"><img src="https://www.dhesioinfluencer.com/images/singlepage/logo.png" style="width:50px"> &nbsp;Dhesìo</span> <span
                            style="color: #274674;">Influencer</span></div>
                            <div style="margin:30px"></div>
                            
                            <div style="margin:5px 5%"> 
                        <table style="width:100% ;border-spacing: 10px; padding:5px;" >

                            <tr>
                                <td style="width:100%;vertical-align: top;">
                                <div style="font-size:14px; ">

                                

                                <span style="font-size:20px">Ciao ${item.nome}, <b>Benvenuto!</b> </span>

                                <br><br>

                                Stiamo lavorando duramente per rivoluzionare il rapporto tra Aziende e Influencer
                                <div style="margin:18px"></div>
                                con l'obiettivo di <b>massimizzarne l'efficacia</b>
                                e <b>ridurre tempi e costi di ricerca</b> dell'Influencer adatto.
                                <div style="margin:18px"></div>
                                <b>Come?</b>
                                <div style="margin:18px"></div>
                                Lo scopriremo insieme <b>il 10 Dicembre!</b>
                                <div style="margin:18px"></div>
                                Ti manderemo <b>una mail a settimana di recap</b> (no spam) in cui potrai essere aggiornato sullo lo stato di avanzamento dei lavori :)
                                </div>
                                </td>
                                
                            </tr>
            
                        </table>

                        <div style="margin:10px;"></div>

                        <table style="width:100%; border-spacing: 10px; padding:5px;" >

                            <tr>
                                <td style="width:100%;vertical-align: top;">
                                <div style="font-size:14px;">

                                
                                Nel frattempo, pubblicheremo ogni <b>Mar - Gio - Sab</b> contenuti relativi all'<b>Influencer Marketing (IM)</b> nei quali forniremo spunti interessanti e consigli pratici.
                                <div style="margin:18px"></div>
                                In più <b>ogni domenica</b> pubblicheremo un video dove <b>sintetizzeremo gli argomenti trattati</b> durante la settimana e <b>racconteremo</b> il nostro viaggio.
                                <div style="margin:18px"></div>

                                <b>I contenuti saranno raccolti all'interno del nostro sito</b>
                                <a href="dhesioinfluencer.com/aziende/dhesioinfluencer" style="color: #274674;">Dhesioinfluencer.com</a>
                                in maniera completa e ordinata,
                                ma saranno <b>comunque accessibili<b> anche dai nostri canali:
                                

                                <ol>
                                    <li><b>Instagram</b></li>
                                    <li><b>YouTube</b></li>
                                    <li><b>Facebook</b></li>
                                <ol>
                                </div>
                                </td>
                                
                            </tr>
            
                        </table>

                        <div style="margin:8px;"></div>

                        <table style="width:100%; border-spacing: 10px; padding:5px;" >

                            <tr>
                                <td style="width:100%;vertical-align: top;">
                                <div style="font-size:14px; ">

                                
                                Hai già collaborato con Influencer? <b>Hai riscontrato qualche tipo di problema?</b>
                                <div style="margin:18px"></div>

                                Ci piacerebbe che ce lo raccontassi per capire come possiamo risolverli!<br><b>Rispondi a questa mail per facerlo sapere</b>
                                <div style="margin:18px"></div>

                                
                                <div style="margin:18px"></div>

                                Buona giornata!
                                
                                </div>
                                </td>
                                
                            </tr>
            
                        </table>

                                <div style="margin:30px"></div>

                            <div style="text-align:center">


                                <a href="https://instagram.com/dhesioinfluencer">
                                <img src="dhesioinfluencer.com/images/instagramBlu.png" style="width:35px"></a>&nbsp;&nbsp;

                                <a href="https://www.youtube.com/channel/UCB00kViN2jJNbK2ctM-ts2w">
                                <img src="dhesioinfluencer.com/images/youtubeBlu.png" style="width:35px"></a>&nbsp;&nbsp;

                                <a href="https://www.facebook.com/dhesioinfluencer">
                                <img src="dhesioinfluencer.com/images/facebookBlu.png" style="width:35px"></a>
                            </div>

                                <div style="margin:30px"></div>
                                    

                        <div style=" text-align:center;">
                            
                            <a href="dhesioinfluencer.com/privacyazienda">privacy policy</a>
                    --
                            <i>DhesioInfluencer, Roma 00142, ROMA (RM)</i>
                        </div>

                        </div>


                    </div>
                    <div></div>
                </div>
            </body>
            
            </html>`
        };

        mailTransporter.sendMail(mailDetails, async function (err, data) {
            if (err) {
                console.log('Error Occurs' + item.email);
                console.log(err);
            } else {
                console.log('Email sent successfully to ' + item.email);
                item.nmail = nmail;
                await item.save();
            }
        });

    })

    res.send(`ok <br>numero mail: ${nmail}`);
}

exports.getMandaMailSendGrid = async (req, res, next) => {

    const msg = {
        to: 'andreaorfino.263@gmail.com.com', // Change to your recipient
        from: 'dhesio.official@gmail.com', // Change to your verified sender
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })

    res.send(`ok <br>numero mail:`);
}