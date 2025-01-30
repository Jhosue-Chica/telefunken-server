const express = require('express');
const router = express.Router();
const winsController = require('../controllers/winsController');

router.post('/', winsController.createWin);
router.get('/', winsController.getWins);

module.exports = router;