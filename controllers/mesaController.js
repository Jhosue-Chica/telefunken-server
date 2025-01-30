const { FieldValue } = require('firebase-admin/firestore');
const db = require('../config/firebase');

const mesasCollection = db.collection('mesas');

exports.createMesa = async (req, res) => {
  try {
    const { cant_jugadores, cant_barajas, cod_sala } = req.body;

    const newMesa = {
      cant_jugadores,
      cant_barajas,
      cod_sala,
      estado: 'disponible',
      jugadores: [],
      fecha_creacion: FieldValue.serverTimestamp(),
      ultima_actualizacion: FieldValue.serverTimestamp()
    };

    const docRef = await mesasCollection.add(newMesa);
    res.status(201).json({ id: docRef.id, ...newMesa });
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

exports.updateMesaEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    await mesasCollection.doc(id).update({
      estado,
      ultima_actualizacion: FieldValue.serverTimestamp()
    });

    res.json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};