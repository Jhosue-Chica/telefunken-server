const express = require('express');
const router = express.Router();
const { createWin } = require('../controllers/winsController');
const { getWins } = require('../controllers/winsController');

router.post('/', createWin);
router.get('/', getWins);

module.exports = router;