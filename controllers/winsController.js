// controllers/winsController.js
const { db, winsCollection } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

exports.createWin = async (req, res) => {
    try {
        const { mesa_ref, jugador, puntuacion } = req.body;

        const newWin = {
            mesa_ref: db.doc(mesa_ref),
            jugador,
            puntuacion,
            fecha: FieldValue.serverTimestamp()
        };

        const docRef = await winsCollection.add(newWin);
        res.status(201).json({ id: docRef.id, ...newWin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getWins = async (req, res) => {
    try {
        const winsSnapshot = await winsCollection.get();
        const wins = [];
        winsSnapshot.forEach(doc => {
            wins.push({ id: doc.id, ...doc.data() });
        });
        res.json(wins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};