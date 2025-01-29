const express = require('express');
const router = express.Router();
const { createPlayer } = require('../controllers/playerController');
const { getPlayers } = require('../controllers/playerController');

router.post('/', createPlayer);
router.get('/', getPlayers);

module.exports = router;