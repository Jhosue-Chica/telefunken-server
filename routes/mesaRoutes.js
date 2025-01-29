const express = require('express');
const router = express.Router();
const { createMesa, getMesas } = require('../controllers/mesaController');

router.post('/', createMesa);
router.get('/', getMesas);

module.exports = router;