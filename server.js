// server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();
const setupWebSocketServer = require('./websocketServer');

const app = express();
const server = http.createServer(app);

// Configuración mejorada de CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Confiar en el proxy de Nginx
app.set('trust proxy', true);

// Middleware para asegurar el uso de HTTPS cuando está en producción
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// Ruta de prueba para verificar el servidor
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    secure: req.secure,
    protocol: req.protocol,
    forwardedProtocol: req.get('x-forwarded-proto')
  });
});

// Importar y usar rutas
const mesaRoutes = require('./routes/mesaRoutes');
const partidaRoutes = require('./routes/partidaRoutes');
const winsRoutes = require('./routes/winsRoutes');

app.use('/api/mesas', mesaRoutes);
app.use('/api/partidas', partidaRoutes);
app.use('/api/wins', winsRoutes);

// Configurar el servidor WebSocket
setupWebSocketServer(server);

// Escuchar en todas las interfaces de red
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});