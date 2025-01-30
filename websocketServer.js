// websocketServer.js
const WebSocket = require('ws');
const { mesasCollection } = require('./config/firebase');
const url = require('url');

// Verificar que la colección esté disponible
if (!mesasCollection) {
  throw new Error('mesasCollection no está disponible. Verifica la configuración de Firebase.');
}

function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });
  
  // Mantener un registro de las conexiones por mesa
  const mesaConnections = new Map();

  wss.on('connection', async (ws, req) => {
    console.log('Nueva conexión WebSocket recibida');
    
    try {
      // Obtener el ID de la mesa de la URL
      const pathname = url.parse(req.url).pathname;
      const segments = pathname.split('/');
      const mesaId = segments[segments.length - 1];
      
      console.log('Conectando a mesa:', mesaId);
      
      // Verificar si la ruta es válida
      if (!pathname.startsWith('/ws/mesa/')) {
        console.log('Ruta inválida:', pathname);
        ws.close();
        return;
      }

      // Verificar si la mesa existe antes de suscribirse
      try {
        const mesaDoc = await mesasCollection.doc(mesaId).get();
        if (!mesaDoc.exists) {
          console.log('Mesa no encontrada:', mesaId);
          ws.close();
          return;
        }
      } catch (error) {
        console.error('Error al verificar la mesa:', error);
        ws.close();
        return;
      }
      
      // Agregar la conexión al registro de la mesa
      if (!mesaConnections.has(mesaId)) {
        mesaConnections.set(mesaId, new Set());
      }
      mesaConnections.get(mesaId).add(ws);

      // Configurar la escucha de cambios en Firestore
      const unsubscribe = mesasCollection.doc(mesaId)
        .onSnapshot(
          doc => {
            if (doc.exists) {
              const mesaData = {
                id: doc.id,
                ...doc.data()
              };

              console.log('Enviando actualización de mesa:', mesaData);

              // Enviar actualización a todos los clientes conectados a esta mesa
              const message = JSON.stringify({
                type: 'mesa_update',
                mesa: mesaData
              });

              mesaConnections.get(mesaId)?.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                  try {
                    client.send(message);
                  } catch (error) {
                    console.error('Error al enviar mensaje a cliente:', error);
                  }
                }
              });
            } else {
              console.log('La mesa ya no existe:', mesaId);
              ws.close();
            }
          },
          error => {
            console.error('Error en onSnapshot:', error);
            ws.close();
          }
        );

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('Mensaje recibido:', data);
          
          if (data.type === 'join_mesa') {
            console.log(`Jugador ${data.jugador.nombre} se unió a la mesa ${data.mesaId}`);
          }
        } catch (error) {
          console.error('Error al procesar mensaje:', error);
        }
      });

      ws.on('error', (error) => {
        console.error('Error en la conexión WebSocket:', error);
      });

      ws.on('close', () => {
        console.log(`Conexión cerrada para mesa ${mesaId}`);
        // Eliminar la conexión cuando se cierra
        mesaConnections.get(mesaId)?.delete(ws);
        if (mesaConnections.get(mesaId)?.size === 0) {
          mesaConnections.delete(mesaId);
          unsubscribe(); // Detener la escucha de Firestore
        }
      });
    } catch (error) {
      console.error('Error en la configuración de la conexión:', error);
      ws.close();
    }
  });

  // Agregar manejo de errores al nivel del servidor WebSocket
  wss.on('error', (error) => {
    console.error('Error en el servidor WebSocket:', error);
  });

  return wss;
}

module.exports = setupWebSocketServer;