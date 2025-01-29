const db = require('../config/firebase');

const playersCollection = db.collection('players');

exports.createPlayer = async (req, res) => {
    try {
        const { nombre } = req.body;
        const snapshot = await playersCollection.orderBy('id_player', 'desc').limit(1).get();
        const lastId = snapshot.empty ? 0 : snapshot.docs[0].data().id_player;

        const newPlayer = {
            id_player: lastId + 1,
            nombre
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
