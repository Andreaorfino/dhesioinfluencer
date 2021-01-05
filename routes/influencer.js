const express = require('express');

const influencerController = require('../controllers/influencer');

const router = express.Router();

const isAuth = require('../middleware/is-auth');
const notAuth = require('../middleware/not-auth');


router.get('/registrazione', notAuth, influencerController.getRegistrazione);
router.post('/registrazione', influencerController.postRegistrazione);

router.get('/resetpassword',notAuth, influencerController.getRecuperaPassword);
router.post('/resetpassword', influencerController.postRecuperaPassword);

router.get('/registrazioneCompletata', influencerController.getRegistrazioneCompletata);

router.get('/profilo/:nickname', influencerController.getProfiloAltro);
router.get('/profilo', isAuth, influencerController.getProfilo);


router.get('/accedi',notAuth, influencerController.getAccedi);
router.post('/accedi', influencerController.postAccedi);

router.post('/aggiornaProfilo', isAuth,influencerController.postAggiornaProfilo);
router.post('/eliminatoAccount', influencerController.postCancella);

router.get('/modificaCollaborazione/:collaborazioneId',isAuth, influencerController.getModificaCollab);

//router.get('/aggiorna', influencerController.getAggiornaLikeEStelle); 

module.exports = router;