const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

// For Netlify Functions, use /tmp directory which is writable
const DB_PATH = process.env.DATABASE_PATH || (process.env.NODE_ENV === 'production' ? '/tmp/reservations.db' : path.join(__dirname, '../database/reservations.db'));

class Database {
  constructor() {
    this.db = null;
  }

  async initialize() {
    try {
      console.log('Initializing database at:', DB_PATH);
      console.log('Environment:', process.env.NODE_ENV);
      
      // Ensure database directory exists
      const dbDir = path.dirname(DB_PATH);
      try {
        await fs.mkdir(dbDir, { recursive: true });
        console.log('Database directory created/verified:', dbDir);
      } catch (dirError) {
        console.log('Directory creation error (may already exist):', dirError.message);
      }

      // Create database connection
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          throw err;
        }
        console.log('Connected to SQLite database at:', DB_PATH);
      });

      // Enable foreign keys
      await this.run('PRAGMA foreign_keys = ON');

      // Create tables
      await this.createTables();
      
      // Check if database is empty and seed with initial data
      const siteCount = await this.get('SELECT COUNT(*) as count FROM sites');
      if (siteCount.count === 0) {
        console.log('Database is empty, seeding with initial data...');
        await this.seedInitialData();
      }
      
      console.log('Database initialization completed successfully');
      return this.db;
    } catch (error) {
      console.error('Database initialization failed:', error);
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
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

  async seedInitialData() {
    const sites = [
      // Campsites (4)
      {
        id: 'campsite-1',
        name: 'Riverside Retreat',
        type: 'campsite',
        capacity: 4,
        price: 45.00,
        amenities: JSON.stringify(['Fire pit', 'Picnic table', 'Water access', 'Hot springs access', 'Restroom nearby', 'Trash pickup']),
        description: 'A peaceful campsite nestled along the mountain stream with easy access to natural hot springs.',
        images: JSON.stringify(['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3']),
        features: JSON.stringify(['Stream-side location', 'Shaded area', '24/7 hot springs access', 'Wildlife viewing']),
        size: '20x30 ft'
      },
      {
        id: 'campsite-2',
        name: 'Mountain View Base',
        type: 'campsite',
        capacity: 6,
        price: 50.00,
        amenities: JSON.stringify(['Fire pit', 'Picnic table', 'Electric hookup', 'Hot springs access', 'Bear box', 'Level tent pad']),
        description: 'Spacious campsite with stunning mountain vistas and convenient electric hookup.',
        images: JSON.stringify(['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?ixlib=rb-4.0.3']),
        features: JSON.stringify(['Panoramic mountain views', 'Electric hookup', 'Large flat area', 'Easy vehicle access']),
        size: '25x35 ft'
      },
      // Cabins (4)
      {
        id: 'cabin-1',
        name: 'Cozy Pine Cabin',
        type: 'cabin',
        capacity: 4,
        price: 120.00,
        amenities: JSON.stringify(['Full kitchen', 'Private bathroom', 'Fireplace', 'Hot springs access', 'WiFi', 'Heating']),
        description: 'Charming one-bedroom cabin with rustic charm and modern amenities.',
        images: JSON.stringify(['/cabin_pics/cabin-01.jpg']),
        features: JSON.stringify(['Wood-burning fireplace', 'Full kitchen', 'Private deck', 'Mountain views']),
        size: '600 sq ft',
        bedrooms: 1,
        bathrooms: 1
      },
      {
        id: 'cabin-2',
        name: 'Family Lodge',
        type: 'cabin',
        capacity: 8,
        price: 180.00,
        amenities: JSON.stringify(['Full kitchen', 'Two bathrooms', 'Living room', 'Hot springs access', 'WiFi', 'Heating']),
        description: 'Spacious three-bedroom family lodge perfect for group retreats.',
        images: JSON.stringify(['/cabin_pics/cabin-04.jpg']),
        features: JSON.stringify(['Large living area', 'Game room', 'Full laundry', 'Private BBQ area']),
        size: '1200 sq ft',
        bedrooms: 3,
        bathrooms: 2
      },
      // Premium Sites (2)
      {
        id: 'premium-1',
        name: 'Luxury Glamping Tent',
        type: 'premium',
        capacity: 4,
        price: 200.00,
        amenities: JSON.stringify(['King bed', 'Private bathroom', 'Mini fridge', 'Hot springs access', 'WiFi', 'Heating']),
        description: 'Luxurious safari-style tent with hotel-quality amenities and stunning mountain views.',
        images: JSON.stringify(['/cabin_pics/cabin-10.jpg']),
        features: JSON.stringify(['Safari-style tent', 'Hotel amenities', 'Premium location', 'Concierge service']),
        size: '400 sq ft',
        bedrooms: 1,
        bathrooms: 1
      }
    ];

    const insertSite = `
      INSERT INTO sites (
        id, name, type, capacity, price, amenities, description, 
        images, features, size, bedrooms, bathrooms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    for (const site of sites) {
      await this.run(insertSite, [
        site.id,
        site.name,
        site.type,
        site.capacity,
        site.price,
        site.amenities,
        site.description,
        site.images,
        site.features,
        site.size || null,
        site.bedrooms || null,
        site.bathrooms || null
      ]);
    }
    
    console.log(`Successfully seeded ${sites.length} sites`);
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