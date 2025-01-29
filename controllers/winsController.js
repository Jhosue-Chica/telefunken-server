const db = require('../config/firebase');

const winsCollection = db.collection('wins');

exports.createWin = async (req, res) => {
    try {
        const { wins_player, wins_score, wins_timegame } = req.body;
        const snapshot = await winsCollection.orderBy('id_wins', 'desc').limit(1).get();
        const lastId = snapshot.empty ? 0 : snapshot.docs[0].data().id_wins;

        const newWin = {
            id_wins: lastId + 1,
            wins_player,
            wins_score,
            wins_timegame: new Date(wins_timegame)
        };

        await winsCollection.add(newWin);
        res.status(201).json(newWin);
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