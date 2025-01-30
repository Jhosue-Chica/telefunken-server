// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});