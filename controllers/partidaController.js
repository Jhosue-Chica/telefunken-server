const { FieldValue } = require('firebase-admin/firestore');
const db = require('../config/firebase');

const partidasCollection = db.collection('partidas');

exports.createPartida = async (req, res) => {
    try {
        const { id_mesa, jugadores } = req.body;

        const rondas = {
            '1/3': { valores: ['', '', '', ''], puntuacion: 0 },
            '2/3': { valores: ['', '', '', ''], puntuacion: 0 },
            '1/4': { valores: ['', '', '', ''], puntuacion: 0 },
            '2/4': { valores: ['', '', '', ''], puntuacion: 0 },
            '1/5': { valores: ['', '', '', ''], puntuacion: 0 },
            '2/5': { valores: ['', '', '', ''], puntuacion: 0 },
            'Escalera': { valores: ['', '', '', ''], puntuacion: 0 }
        };

        const jugadoresData = {};
        jugadores.forEach(jugador => {
            jugadoresData[jugador.id] = {
                nombre: jugador.nombre,
                puntuacion_total: 0,
                rondas: { ...rondas }
            };
        });

        const newPartida = {
            id_mesa: db.doc(`mesas/${id_mesa}`),
            fecha_creacion: FieldValue.serverTimestamp(),
            estado: 'en_curso',
            jugadores: jugadoresData
        };

        const docRef = await partidasCollection.add(newPartida);
        res.status(201).json({ id: docRef.id, ...newPartida });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPartidas = async (req, res) => {
    try {
        const partidasSnapshot = await partidasCollection.get();
        const partidas = [];
        partidasSnapshot.forEach(doc => {
            partidas.push({ id: doc.id, ...doc.data() });
        });
        res.json(partidas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPartidaById = async (req, res) => {
    try {
        const { id } = req.params;
        const partidaDoc = await partidasCollection.doc(id).get();

        if (!partidaDoc.exists) {
            return res.status(404).json({ message: 'Partida no encontrada' });
        }

        res.json({ id: partidaDoc.id, ...partidaDoc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePartidaRonda = async (req, res) => {
    try {
        const { id } = req.params;
        const { jugador_id, ronda, valores, puntuacion } = req.body;

        const updateData = {};
        updateData[`jugadores.${jugador_id}.rondas.${ronda}.valores`] = valores;
        updateData[`jugadores.${jugador_id}.rondas.${ronda}.puntuacion`] = puntuacion;

        await partidasCollection.doc(id).update(updateData);

        // Actualizar puntuación total
        const partidaDoc = await partidasCollection.doc(id).get();
        const jugadorData = partidaDoc.data().jugadores[jugador_id];
        const puntuacionTotal = Object.values(jugadorData.rondas)
            .reduce((total, ronda) => total + (ronda.puntuacion || 0), 0);

        await partidasCollection.doc(id).update({
            [`jugadores.${jugador_id}.puntuacion_total`]: puntuacionTotal
        });

        res.json({ message: 'Ronda actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};