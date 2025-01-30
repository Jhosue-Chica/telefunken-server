const express = require('express');
const router = express.Router();
const mesaController = require('../controllers/mesaController');

router.post('/', mesaController.createMesa);
router.get('/', mesaController.getMesas);
router.patch('/:id/estado', mesaController.updateMesaEstado);

module.exports = router;