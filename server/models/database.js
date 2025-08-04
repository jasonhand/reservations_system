const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../database/reservations.db');

class Database {
  constructor() {
    this.db = null;
  }

  async initialize() {
    try {
      // Ensure database directory exists
      const dbDir = path.dirname(DB_PATH);
      await fs.mkdir(dbDir, { recursive: true });

      // Create database connection
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          throw err;
        }
        console.log('Connected to SQLite database');
      });

      // Enable foreign keys
      await this.run('PRAGMA foreign_keys = ON');

      // Create tables
      await this.createTables();
      
      return this.db;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async createTables() {
    const createSitesTable = `
      CREATE TABLE IF NOT EXISTS sites (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('campsite', 'cabin', 'premium')),
        capacity INTEGER NOT NULL,
        price REAL NOT NULL,
        amenities TEXT NOT NULL, -- JSON string
        description TEXT NOT NULL,
        images TEXT NOT NULL, -- JSON string
        features TEXT NOT NULL, -- JSON string
        size TEXT,
        bedrooms INTEGER,
        bathrooms INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createReservationsTable = `
      CREATE TABLE IF NOT EXISTS reservations (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL,
        site_name TEXT NOT NULL,
        guest_name TEXT NOT NULL,
        guest_email TEXT NOT NULL,
        guest_phone TEXT NOT NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        guests INTEGER NOT NULL,
        total_cost REAL NOT NULL,
        special_requests TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
        verification_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (site_id) REFERENCES sites (id)
      )
    `;

    const createAvailabilityTable = `
      CREATE TABLE IF NOT EXISTS site_availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site_id TEXT NOT NULL,
        date DATE NOT NULL,
        available BOOLEAN NOT NULL DEFAULT 1,
        FOREIGN KEY (site_id) REFERENCES sites (id),
        UNIQUE(site_id, date)
      )
    `;

    try {
      await this.run(createSitesTable);
      await this.run(createReservationsTable);
      await this.run(createAvailabilityTable);

      // Create indexes for better performance
      await this.run('CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations (check_in, check_out)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_reservations_site ON reservations (site_id)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations (status)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_availability_site_date ON site_availability (site_id, date)');

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Database run error:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Database get error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Database all error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

// Singleton instance
const database = new Database();

async function initializeDatabase() {
  return await database.initialize();
}

function getDatabase() {
  if (!database.db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return database;
}

module.exports = {
  initializeDatabase,
  getDatabase,
  Database
};