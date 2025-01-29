const express = require('express');
const router = express.Router();
const { 
    createPlayer, 
    getPlayers, 
    loginPlayer, 
    updateAvatar,
    getPlayerByName 
} = require('../controllers/playerController');

// Rutas
router.post('/', createPlayer);
router.get('/', getPlayers);
router.post('/login', loginPlayer);
router.patch('/:id/avatar', updateAvatar);
router.get('/name/:name', getPlayerByName);

module.exports = router;