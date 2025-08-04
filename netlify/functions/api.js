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

// Initialize database on cold start with timeout
let dbInitialized = false;
let dbInitPromise = null;

app.use(async (req, res, next) => {
  if (!dbInitialized) {
    if (!dbInitPromise) {
      dbInitPromise = initializeDatabaseWithTimeout();
    }
    
    try {
      await dbInitPromise;
      dbInitialized = true;
      console.log('Database initialized for serverless function');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // Don't fail the request, let it continue with mock data
      console.log('Continuing with mock data due to database initialization failure');
    }
  }
  next();
});

// Initialize database with timeout
async function initializeDatabaseWithTimeout() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Database initialization timeout'));
    }, 10000); // 10 second timeout
    
    initializeDatabase()
      .then(() => {
        clearTimeout(timeout);
        resolve();
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

// API routes
app.use('/sites', sitesRouter);
app.use('/reservations', reservationsRouter);
app.use('/admin', adminRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'production-netlify',
    databaseInitialized: dbInitialized
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Netlify function is working',
    timestamp: new Date().toISOString()
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