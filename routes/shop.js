const path = require('path');
const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getSinglePage);

router.get('/aiuto', shopController.getAiuto);

router.get('/privacy', shopController.getPrivacy);
router.get('/privacyAzienda', shopController.getPrivacyAziende);

router.get('/regolamento', shopController.getRegolamento);

router.get('/dettagli/:productId', shopController.getEvento);

router.post('/cart', shopController.postCart);

router.get('/imieisconti', shopController.getIMieiSconti);

router.post('/comprato', shopController.postMettiSconto);

router.post('/noncomprato', shopController.postTogliSconto);

//=================
// dhesio 2.0
//=================

router.get('/eventi/:influencer/:evento', shopController.getEventiInfluencer);


module.exports = router;
