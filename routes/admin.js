const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/uppolo',isAuth, adminController.getUppolo);
router.post('/uppolo',isAuth, adminController.postUppolo);

router.get('/uppoloLotteria',isAuth, adminController.getUppoloLotteria);
router.post('/uppoloLotteria',isAuth, adminController.postUppoloLotteria);

router.get('/utenti/:productId',isAuth, adminController.getUtenti);

router.post('/eccoVincitore',isAuth,adminController.postEccoVincitore);
router.get('/elimina/:productId',isAuth,adminController.getEliminaLotteria);

router.post('/periodo',isAuth,adminController.postPeriodo);
router.get('/periodo',isAuth,adminController.getPeriodo);

router.get('/p',isAuth,adminController.p); 
router.get('/fidel',isAuth,adminController.getFidelity); 
router.get('/recap',isAuth,adminController.getVisual); 

router.get('/resetGenera', adminController.getGeneraResetPassword);
router.post('/resetGenera', adminController.postGeneraResetPassword);

module.exports = router;
