const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const isAuth = require('../middleware/is-auth');
const notAuth = require('../middleware/not-auth');

const fornitoriController = require('../controllers/fornitore');
const fornitoriAuthController = require('../controllers/fornitoriAuth');

const router = express.Router();

router.get('/', fornitoriController.getAziende);

/* registrazione e login aziende */
router.get('/registrazione', fornitoriAuthController.getRegistrazioneAziende);

/* proposte di collab */
router.get('/proposteCollab', isAuth, fornitoriController.getProposteCollaborazioni);

router.post('/svela', fornitoriController.postSvela);

router.get('/InserisciCollaborazione', fornitoriController.getFormAzienda);
router.post('/InserisciCollaborazione', fornitoriController.postFormAzienda);

/* sta arrivando */
router.get('/scopriDhesio', fornitoriController.getLandingPage);
router.get('/staArrivando', fornitoriController.getInArrivo);
router.get('/dhesioInfluencer', fornitoriController.getIscritto);
router.get('/dhesioInfluencerProva', fornitoriController.getIscrittoBeta);

router.post('/listaAttesa', fornitoriController.postIscritto);

router.post('/event', fornitoriController.postEvento);
router.post('/land', fornitoriController.postArrivo);

router.get('/mandaMail/:nmail', fornitoriController.getMandaMail);
router.get('/mandaMaille', fornitoriController.getMandaMailSendGrid);

router.get('/profilo/:nome', fornitoriController.getAzienda);

module.exports = router;
