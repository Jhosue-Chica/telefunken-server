// config/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Obtener instancia de Firestore
const db = admin.firestore();

// Crear referencias a las colecciones
const mesasCollection = db.collection('mesas');
const partidasCollection = db.collection('partidas');
const winsCollection = db.collection('wins');

// Exportar tanto la base de datos como las colecciones
module.exports = {
  db,
  mesasCollection,
  partidasCollection,
  winsCollection
};