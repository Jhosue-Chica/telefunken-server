// websocketServer.js
const WebSocket = require('ws');
const { mesasCollection } = require('./config/firebase');
const url = require('url');

// Verificar que la colección esté disponible
if (!mesasCollection) {
  throw new Error('mesasCollection no está disponible. Verifica la configuración de Firebase.');
}

function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ 
    server,
    clientTracking: true,
    // Configuraciones avanzadas para mejorar rendimiento y estabilidad
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      clientNoContextTakeover: true,
      serverNoContextTakeover: true,
      threshold: 1024
    }
  });
  
  // Mantener un registro de las conexiones por mesa
  const mesaConnections = new Map();

  wss.on('connection', async (ws, req) => {
    console.log('Nueva conexión WebSocket recibida');
    console.log('Headers:', req.headers);
    
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
      
      // Setup heartbeat para mantener la conexión
      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });
      
      // Agregar la conexión al registro de la mesa
      if (!mesaConnections.has(mesaId)) {
        mesaConnections.set(mesaId, new Set());
      }
      mesaConnections.get(mesaId).add(ws);

      // Configurar la escucha de cambios en Firestore
      const unsubscribe = mesasCollection.doc(mesaId)
        .onSnapshot(
          doc => {
            if (doc.exists && ws.readyState === WebSocket.OPEN) {
              const mesaData = {
                id: doc.id,
                ...doc.data()
              };

              console.log('Enviando actualización de mesa:', mesaData);
              try {
                ws.send(JSON.stringify({
                  type: 'mesa_update',
                  mesa: mesaData
                }));
              } catch (error) {
                console.error('Error al enviar mensaje:', error);
                ws.close();
              }
            } else if (!doc.exists) {
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
        ws.isAlive = false;
        mesaConnections.get(mesaId)?.delete(ws);
        if (mesaConnections.get(mesaId)?.size === 0) {
          mesaConnections.delete(mesaId);
          unsubscribe();
        }
      });
    } catch (error) {
      console.error('Error en la configuración de la conexión:', error);
      ws.close();
    }
  });

  // Ping/Pong para mantener conexiones activas
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  return wss;
}

module.exports = setupWebSocketServer;