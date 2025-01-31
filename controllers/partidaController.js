// controllers/partidaController.js
const { db, partidasCollection } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

const RONDAS_ORDEN = ['1/3', '2/3', '1/4', '2/4', '1/5', '2/5', 'Escalera'];

exports.createPartida = async (req, res) => {
    try {
        const { id_mesa, jugadores } = req.body;

        // Crear estructura de rondas inicial
        const rondas = {};
        RONDAS_ORDEN.forEach(ronda => {
            rondas[ronda] = {
                valor: '', // Ahora cada ronda tiene un único valor
                completada: false
            };
        });

        // Inicializar datos de jugadores
        const jugadoresData = {};
        jugadores.forEach((jugador, index) => {
            jugadoresData[jugador.id] = {
                nombre: jugador.nombre,
                posicion: index,
                puntuacion_total: null,
                rondas_completadas: 0,
                rondas: { ...rondas }
            };
        });

        const newPartida = {
            id_mesa: db.doc(`mesas/${id_mesa}`),
            fecha_creacion: FieldValue.serverTimestamp(),
            estado: 'en_curso',
            num_jugadores: jugadores.length,
            jugadores: jugadoresData,
            ronda_actual: RONDAS_ORDEN[0]
        };

        const docRef = await partidasCollection.add(newPartida);
        res.status(201).json({ id: docRef.id, ...newPartida });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePartidaRonda = async (req, res) => {
    try {
        const { id } = req.params;
        const { jugador_id, ronda, valor } = req.body;

        // Obtener datos actuales de la partida
        const partidaDoc = await partidasCollection.doc(id).get();
        const partidaData = partidaDoc.data();
        const jugadorData = partidaData.jugadores[jugador_id];

        if (!jugadorData) {
            return res.status(404).json({ error: 'Jugador no encontrado' });
        }

        // Validar que la ronda existe
        if (!RONDAS_ORDEN.includes(ronda)) {
            return res.status(400).json({ error: 'Ronda no válida' });
        }

        // Actualizar el valor de la ronda para el jugador
        const updateData = {};
        updateData[`jugadores.${jugador_id}.rondas.${ronda}.valor`] = valor;

        // Verificar si el jugador completó todas sus rondas
        let rondasCompletadas = 0;
        RONDAS_ORDEN.forEach(r => {
            if (jugadorData.rondas[r].valor !== '') {
                rondasCompletadas++;
            }
        });

        // Si completó todas las rondas, calcular puntuación total
        if (rondasCompletadas === RONDAS_ORDEN.length) {
            const puntuacionTotal = RONDAS_ORDEN.reduce((total, rondaNombre) => {
                const valorRonda = jugadorData.rondas[rondaNombre].valor;
                return total + (parseInt(valorRonda) || 0);
            }, 0);
            
            updateData[`jugadores.${jugador_id}.puntuacion_total`] = puntuacionTotal;
            updateData[`jugadores.${jugador_id}.rondas_completadas`] = rondasCompletadas;
        }

        // Actualizar documento
        await partidasCollection.doc(id).update(updateData);

        // Verificar si todos los jugadores completaron la ronda actual
        const todosCompletaron = Object.values(partidaData.jugadores).every(jugador => 
            jugador.rondas[ronda].valor !== ''
        );

        if (todosCompletaron) {
            const rondaActualIndex = RONDAS_ORDEN.indexOf(ronda);
            if (rondaActualIndex < RONDAS_ORDEN.length - 1) {
                // Avanzar a la siguiente ronda
                await partidasCollection.doc(id).update({
                    ronda_actual: RONDAS_ORDEN[rondaActualIndex + 1]
                });
            } else {
                // Finalizar partida si era la última ronda
                await partidasCollection.doc(id).update({
                    estado: 'finalizada'
                });
            }
        }

        res.json({ 
            message: 'Ronda actualizada correctamente',
            rondas_completadas: rondasCompletadas
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Los métodos getPartidas y getPartidaById se mantienen igual
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