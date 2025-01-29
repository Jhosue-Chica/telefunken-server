const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = require('./serviceAccountKey.json');

// Inicializa Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas para mesas
app.post('/api/mesas', async (req, res) => {
  try {
    const { cant_jugadores, cant_barajas, cod_sala } = req.body;
    const mesaRef = db.collection('mesas');
    
    // Obtener el último ID
    const snapshot = await mesaRef.orderBy('idmesa', 'desc').limit(1).get();
    const lastId = snapshot.empty ? 0 : snapshot.docs[0].data().idmesa;
    
    const newMesa = {
      idmesa: lastId + 1,
      cant_jugadores,
      cant_barajas,
      cod_sala
    };
    
    await mesaRef.add(newMesa);
    res.status(201).json(newMesa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/mesas', async (req, res) => {
  try {
    const mesasSnapshot = await db.collection('mesas').get();
    const mesas = [];
    mesasSnapshot.forEach(doc => {
      mesas.push({ id: doc.id, ...doc.data() });
    });
    res.json(mesas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas para jugadores
app.post('/api/players', async (req, res) => {
  try {
    const { nombre } = req.body;
    const playerRef = db.collection('players');
    
    const snapshot = await playerRef.orderBy('id_player', 'desc').limit(1).get();
    const lastId = snapshot.empty ? 0 : snapshot.docs[0].data().id_player;
    
    const newPlayer = {
      id_player: lastId + 1,
      nombre
    };
    
    await playerRef.add(newPlayer);
    res.status(201).json(newPlayer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas para wins
app.post('/api/wins', async (req, res) => {
  try {
    const { wins_player, wins_score, wins_timegame } = req.body;
    const winsRef = db.collection('wins');
    
    const snapshot = await winsRef.orderBy('id_wins', 'desc').limit(1).get();
    const lastId = snapshot.empty ? 0 : snapshot.docs[0].data().id_wins;
    
    const newWin = {
      id_wins: lastId + 1,
      wins_player,
      wins_score,
      wins_timegame: new Date(wins_timegame)
    };
    
    await winsRef.add(newWin);
    res.status(201).json(newWin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});