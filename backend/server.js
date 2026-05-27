require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth.routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 5000;

// ── Database ─────────────────────────────────────────────────────
connectDB();

// ── Security ──────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // disabled so we can load Google Fonts / CDN
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));

// ── Rate limiting ──────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please slow down.' },
});
app.use('/api/', apiLimiter);

// ── Body parsing & compression ─────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// ── Request logger ─────────────────────────────────────────────────
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl} — ${req.ip}`);
  next();
});

// ── Static frontend files ──────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API routes ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ── Health check ───────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'QuizMaster Pro API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── SPA fallback ───────────────────────────────────────────────────
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
});

// ── Global error handler ───────────────────────────────────────────
app.use((err, req, res, _next) => {
  logger.error(`${err.status || 500} — ${err.message} — ${req.originalUrl}`);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ── Socket.io (placeholder — expanded in Step 4) ──────────────────
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`));
});

// ── Start server ───────────────────────────────────────────────────
server.listen(PORT, () => {
  logger.info(`QuizMaster Pro running on port ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = { app, server };
