const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const mesaRoutes = require('./routes/mesaRoutes');
const playerRoutes = require('./routes/playerRoutes');
const winsRoutes = require('./routes/winsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/mesas', mesaRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/wins', winsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});