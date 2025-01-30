// server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();
const setupWebSocketServer = require('./websocketServer');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Importar rutas
const mesaRoutes = require('./routes/mesaRoutes');
const partidaRoutes = require('./routes/partidaRoutes');
const winsRoutes = require('./routes/winsRoutes');

// Usar rutas
app.use('/api/mesas', mesaRoutes);
app.use('/api/partidas', partidaRoutes);
app.use('/api/wins', winsRoutes);

// Configurar el servidor WebSocket
setupWebSocketServer(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});