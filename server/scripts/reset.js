const { initializeDatabase, getDatabase } = require('../models/database');
const fs = require('fs').promises;
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../database/reservations.db');

async function resetDatabase() {
  try {
    console.log('🗑️  Resetting database...');
    
    // Close any existing connections and remove database file
    try {
      await fs.unlink(DB_PATH);
      console.log('✅ Existing database removed');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.log('ℹ️  No existing database to remove');
      }
    }
    
    // Reinitialize database with fresh tables
    console.log('🔄 Reinitializing database...');
    await initializeDatabase();
    
    console.log('✅ Database reset completed successfully!');
    console.log('💡 Run "npm run db:seed" to populate with sample data');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

// Run reset if called directly
if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase };