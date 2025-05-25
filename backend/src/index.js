const express = require('express');
const cors = require('cors');
const path = require('path');
const postsRoutes = require('./routes/posts');

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', postsRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API del Blog para Desarrolladores funcionando correctamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});