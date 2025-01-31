// routes/partidaRoutes.js
const express = require('express');
const router = express.Router();
const partidaController = require('../controllers/partidaController');

// Middleware de validación para crear partida
const validateCreatePartida = (req, res, next) => {
    const { jugadores, id_mesa } = req.body;
    
    if (!id_mesa) {
        return res.status(400).json({ error: 'Se requiere el ID de la mesa' });
    }
    
    if (!jugadores || !Array.isArray(jugadores)) {
        return res.status(400).json({ error: 'Se requiere un array de jugadores' });
    }
    
    if (!jugadores.every(j => j.id && j.nombre)) {
        return res.status(400).json({ 
            error: 'Cada jugador debe tener id y nombre' 
        });
    }
    
    next();
};

// Middleware de validación para actualizar ronda
const validateUpdateRonda = (req, res, next) => {
    const { jugador_id, ronda, valor } = req.body;
    
    if (!jugador_id || !ronda || valor === undefined) {
        return res.status(400).json({ 
            error: 'Se requieren jugador_id, ronda y valor' 
        });
    }
    
    const rondasValidas = ['1/3', '2/3', '1/4', '2/4', '1/5', '2/5', 'Escalera'];
    if (!rondasValidas.includes(ronda)) {
        return res.status(400).json({ error: 'Ronda no válida' });
    }
    
    // Validar que el valor sea un número o cadena vacía
    if (valor !== '' && isNaN(valor)) {
        return res.status(400).json({ 
            error: 'El valor debe ser un número o cadena vacía' 
        });
    }
    
    next();
};

// Rutas principales
router.post('/', validateCreatePartida, partidaController.createPartida);
router.get('/', partidaController.getPartidas);
router.get('/:id', partidaController.getPartidaById);
router.patch('/:id/ronda', validateUpdateRonda, partidaController.updatePartidaRonda);

// Rutas adicionales que podrían ser útiles
router.get('/:id/estado', (req, res, next) => {
    req.params.includeEstado = true;
    next();
}, partidaController.getPartidaById);

// Middleware para manejar rutas no encontradas
router.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = router;