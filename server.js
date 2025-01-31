// server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const https = require('https');
const fs = require('fs');
require('dotenv').config();
const setupWebSocketServer = require('./websocketServer');

const app = express();

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

// Crear servidor HTTP
const httpServer = http.createServer(app);

// Configurar el servidor WebSocket para HTTP
setupWebSocketServer(httpServer);

// Puerto para HTTP
const HTTP_PORT = process.env.HTTP_PORT || 3000;
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`HTTP Server running on port ${HTTP_PORT}`);
});

// Configurar HTTPS solo si los certificados existen
try {
  const privateKey = fs.readFileSync('/etc/nginx/ssl/private.key', 'utf8');
  const certificate = fs.readFileSync('/etc/nginx/ssl/certificate.crt', 'utf8');
  
  const credentials = {
    key: privateKey,
    cert: certificate
  };

  // Crear servidor HTTPS
  const httpsServer = https.createServer(credentials, app);
  
  // Configurar el servidor WebSocket para HTTPS
  setupWebSocketServer(httpsServer);
  
  // Puerto para HTTPS
  const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
  httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
} catch (error) {
  console.log('HTTPS certificates not found, running only HTTP server');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}