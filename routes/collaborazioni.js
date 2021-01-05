const express = require('express');

const collaborazioniController = require('../controllers/collaborazioni');

const router = express.Router();


router.post('/mettiRecensione', collaborazioniController.postMettiRecensione);
router.post('/mettiRecensioneModifica', collaborazioniController.postAggiornaRecensione);

router.post('/like',collaborazioniController.postLike);



module.exports = router;