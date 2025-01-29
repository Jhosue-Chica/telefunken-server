const db = require('../config/firebase');

const mesasCollection = db.collection('mesas');

exports.createMesa = async (req, res) => {
  try {
    const { cant_jugadores, cant_barajas, cod_sala } = req.body;
    const snapshot = await mesasCollection.orderBy('idmesa', 'desc').limit(1).get();
    const lastId = snapshot.empty ? 0 : snapshot.docs[0].data().idmesa;
    
    const newMesa = {
      idmesa: lastId + 1,
      cant_jugadores,
      cant_barajas,
      cod_sala
    };
    
    await mesasCollection.add(newMesa);
    res.status(201).json(newMesa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMesas = async (req, res) => {
  try {
    const mesasSnapshot = await mesasCollection.get();
    const mesas = [];
    mesasSnapshot.forEach(doc => {
      mesas.push({ id: doc.id, ...doc.data() });
    });
    res.json(mesas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};