require('dotenv').config()

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const{ testConnection } = require('./config/db');

const authRoutes = require('./routes/auth');
const catalogosRoutes = require('./routes/catalogos');
const pedidosRoutes = require('./routes/pedidos');

const app = express();

// Configuración de CORS para permitir solicitudes desde el frontend
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));

// Parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesiones (equivalente al session_start() de PHP)
app.use(session({
  secret:            process.env.SESSION_SECRET || 'dev_secret_change_in_prod',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production', // HTTPS en producción
    maxAge:   Number(process.env.SESSION_MAX_AGE) || 28800000, // 8 horas
  },
}));

app.use('/api/auth',      authRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/pedidos',   pedidosRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

async function start() {
    const PORT = process.env.PORT || 3001;
  await testConnection(); // Verificar BD antes de levantar el server
  app.listen(PORT, () => {
    console.log(`🚀 API corriendo en http://localhost:${PORT}`);
    console.log(`   Entorno: ${process.env.NODE_ENV}`);
    console.log(`   CORS:    ${process.env.CORS_ORIGIN}`);
  });
}

start();