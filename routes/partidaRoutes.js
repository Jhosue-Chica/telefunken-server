const express = require('express');
const router = express.Router();
const partidaController = require('../controllers/partidaController');

router.post('/', partidaController.createPartida);
router.get('/', partidaController.getPartidas);
router.get('/:id', partidaController.getPartidaById);
router.patch('/:id/ronda', partidaController.updatePartidaRonda);

module.exports = router;