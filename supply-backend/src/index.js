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
const corsOrigins = (process.env.CORS_ORIGIN || 'http://10.101.13.204:5173,http://localhost:5173')
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin:      corsOrigins.length > 1 ? corsOrigins : corsOrigins[0],
  credentials: true, // necesario para enviar cookies de sesión
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
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
  await testConnection(); 

  // Agregamos '0.0.0.0' como segundo argumento
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API disponible en la red!`);
    console.log(`🏠 Local:   http://localhost:${PORT}`);
    // Tip: Aquí podrías poner tu IP real para no perderte
    console.log(`🌐 Red:     http://10.101.13.204:${PORT}`); 
    console.log(`🛠️  CORS:    ${corsOrigins.join(', ')}`);
  });
}

start();