// controllers/mesaController.js
const { db, mesasCollection } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

// Crear una nueva mesa
exports.createMesa = async (req, res) => {
  try {
    const { cant_jugadores, cant_barajas, cod_sala, jugadorCreador } = req.body;

    // Crear el objeto de la mesa
    const newMesa = {
      cant_jugadores,
      cant_barajas,
      cod_sala,
      estado: 'en_espera',
      fecha_creacion: FieldValue.serverTimestamp(),
      ultima_actualizacion: FieldValue.serverTimestamp(),
      jugadores: {
        [jugadorCreador.id]: {
          id: jugadorCreador.id,
          nombre: jugadorCreador.nombre,
          avatar: jugadorCreador.avatar
        }
      }
    };

    // Guardar la mesa en Firestore
    const mesaRef = await mesasCollection.add(newMesa);

    // Devolver la respuesta con el ID de la mesa y los datos
    res.status(201).json({
      id: mesaRef.id,
      ...newMesa
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las mesas
exports.getMesas = async (req, res) => {
  try {
    const mesasSnapshot = await mesasCollection.get();
    const mesas = [];

    mesasSnapshot.forEach((mesaDoc) => {
      const mesaData = mesaDoc.data();
      const mesa = {
        id: mesaDoc.id,
        cant_jugadores: mesaData.cant_jugadores,
        cant_barajas: mesaData.cant_barajas,
        cod_sala: mesaData.cod_sala,
        estado: mesaData.estado,
        fecha_creacion: mesaData.fecha_creacion,
        ultima_actualizacion: mesaData.ultima_actualizacion,
        jugadores: mesaData.jugadores
      };
      mesas.push(mesa);
    });

    res.status(200).json(mesas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener una mesa por ID
exports.getMesaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener la referencia de la mesa
    const mesaRef = mesasCollection.doc(id);
    const mesaDoc = await mesaRef.get();

    // Verificar si la mesa existe
    if (!mesaDoc.exists) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    // Obtener los datos de la mesa
    const mesaData = mesaDoc.data();
    const mesa = {
      id: mesaDoc.id,
      cant_jugadores: mesaData.cant_jugadores,
      cant_barajas: mesaData.cant_barajas,
      cod_sala: mesaData.cod_sala,
      estado: mesaData.estado,
      fecha_creacion: mesaData.fecha_creacion,
      ultima_actualizacion: mesaData.ultima_actualizacion,
      jugadores: mesaData.jugadores
    };

    res.status(200).json(mesa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una mesa
exports.updateMesa = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar si la mesa existe
    const mesaRef = mesasCollection.doc(id);
    const mesaDoc = await mesaRef.get();

    if (!mesaDoc.exists) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    // Actualizar los campos proporcionados
    await mesaRef.update({
      ...updateData,
      ultima_actualizacion: FieldValue.serverTimestamp()
    });

    // Obtener los datos actualizados de la mesa
    const updatedMesaDoc = await mesaRef.get();
    const updatedMesa = {
      id: updatedMesaDoc.id,
      ...updatedMesaDoc.data()
    };

    res.status(200).json(updatedMesa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar el estado de una mesa
exports.updateMesaEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar que se proporcionó un estado
    if (!estado) {
      return res.status(400).json({ error: 'Se requiere el estado' });
    }

    // Validar que el estado sea válido
    const estadosValidos = ['en_espera', 'en_curso', 'finalizada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        error: 'Estado no válido. Los estados permitidos son: en_espera, en_curso, finalizada' 
      });
    }

    // Verificar si la mesa existe
    const mesaRef = mesasCollection.doc(id);
    const mesaDoc = await mesaRef.get();

    if (!mesaDoc.exists) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    // Actualizar solo el estado y la última actualización
    await mesaRef.update({
      estado,
      ultima_actualizacion: FieldValue.serverTimestamp()
    });

    // Obtener los datos actualizados de la mesa
    const updatedMesaDoc = await mesaRef.get();
    const updatedMesa = {
      id: updatedMesaDoc.id,
      ...updatedMesaDoc.data()
    };

    res.status(200).json(updatedMesa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};