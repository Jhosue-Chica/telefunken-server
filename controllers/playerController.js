const db = require('../config/firebase');

const playersCollection = db.collection('players');

exports.createPlayer = async (req, res) => {
    try {
        const { name, pass, avatar } = req.body;
        const snapshot = await playersCollection.orderBy('id_player', 'desc').limit(1).get();
        const lastId = snapshot.empty ? 0 : snapshot.docs[0].data().id_player;

        const newPlayer = {
            id_player: lastId + 1,
            name,
            pass,
            avatar: avatar || "/jhosue/avatares1.png" // valor por defecto si no se proporciona
        };

        await playersCollection.add(newPlayer);
        res.status(201).json(newPlayer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPlayers = async (req, res) => {
    try {
        const playersSnapshot = await playersCollection.get();
        const players = [];
        playersSnapshot.forEach(doc => {
            players.push({ id: doc.id, ...doc.data() });
        });
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Agregar método para autenticación
exports.loginPlayer = async (req, res) => {
    try {
        const { name, pass } = req.body;
        const playersSnapshot = await playersCollection
            .where('name', '==', name)
            .where('pass', '==', pass)
            .get();

        if (playersSnapshot.empty) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const playerDoc = playersSnapshot.docs[0];
        const player = { id: playerDoc.id, ...playerDoc.data() };
        res.json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Agregar método para actualizar avatar
exports.updateAvatar = async (req, res) => {
    try {
        const { id } = req.params;
        const { avatar } = req.body;

        const playerRef = playersCollection.doc(id);
        await playerRef.update({ avatar });

        res.json({ message: 'Avatar actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Agregar método para buscar por nombre
exports.getPlayerByName = async (req, res) => {
    try {
        const { name } = req.params;
        const playersSnapshot = await playersCollection
            .where('name', '==', name)
            .get();

        if (playersSnapshot.empty) {
            return res.status(404).json({ error: 'Jugador no encontrado' });
        }

        const playerDoc = playersSnapshot.docs[0];
        const player = { id: playerDoc.id, ...playerDoc.data() };
        res.json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};