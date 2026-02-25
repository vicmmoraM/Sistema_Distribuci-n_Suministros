require('dotenv').config();

const express        = require('express');
const session        = require('express-session');
const cors           = require('cors');
const { testConnection } = require('./config/db');

// ── Rutas ─────────────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/auth');
const catalogosRoutes = require('./routes/catalogos');
const pedidosRoutes   = require('./routes/pedidos');
const reportesRoutes  = require('./routes/reportes');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globales ──────────────────────────────────────────────────────

// CORS — solo permite peticiones desde el frontend React
app.use(cors({
  origin:      process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true, // necesario para enviar cookies de sesión
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

// ── Montaje de rutas ──────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/pedidos',   pedidosRoutes);
app.use('/api/reportes',  reportesRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 catch-all ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// ── Error handler global ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

// ── Arrancar ──────────────────────────────────────────────────────────────────
async function start() {
  await testConnection(); // Verificar BD antes de levantar el server
  app.listen(PORT, () => {
    console.log(`🚀 API corriendo en http://localhost:${PORT}`);
    console.log(`   Entorno: ${process.env.NODE_ENV}`);
    console.log(`   CORS:    ${process.env.CORS_ORIGIN}`);
  });
}

start();