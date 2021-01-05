const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

//-----------------------------------
//----------- inizio nuove route
//-----------------------------------

router.get('/RegistrazioneCompletata',authController.getRegistrazioneCompletata);

router.get('/registrazione', authController.getRegistrazione);
router.post('/registrazione', authController.postRegistrazione);

router.post('/accedi', authController.postAccedi);
router.get('/accedi', authController.getAccedi);

router.post('/cancella', authController.postCancella);

router.get('/Eliminazione_account', authController.getSicuro);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Password has to be valid.')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin
);

router.get('/resetpassword/:resetToken',authController.getResetPassword);
router.post('/resetpassword', authController.postResetPassword);

router.post('/logout', authController.postLogout);



router.post('/postButtamiDentro', authController.postButtamiDentro);

router.post('/postButtamiDentroSconti', authController.postButtamiDentroSconti);


module.exports = router;
