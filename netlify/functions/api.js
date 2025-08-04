const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Import our existing server routes
const sitesRouter = require('../../server/routes/sites');
const reservationsRouter = require('../../server/routes/reservations');
const adminRouter = require('../../server/routes/admin');
const { initializeDatabase } = require('../../server/models/database');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for Netlify deployment
  credentials: true,
}));

// Parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize database on cold start
let dbInitialized = false;

app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      dbInitialized = true;
      console.log('Database initialized for serverless function');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return res.status(500).json({
        success: false,
        error: 'Database initialization failed'
      });
    }
  }
  next();
});

// API routes
app.use('/sites', sitesRouter);
app.use('/reservations', reservationsRouter);
app.use('/admin', adminRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'production-netlify'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Netlify function error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.details
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

module.exports.handler = serverless(app);