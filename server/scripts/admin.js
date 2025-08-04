#!/usr/bin/env node

const { resetDatabase } = require('./reset');
const { seedDatabase } = require('./seed');
const { populateOccupancy } = require('./populate-occupancy');
const { initializeDatabase, getDatabase } = require('../models/database');

// Admin utility functions
async function showStats() {
  try {
    await initializeDatabase();
    const db = getDatabase();
    
    console.log('📊 Database Statistics\n');
    
    // Site counts
    const siteCounts = await db.all(`
      SELECT type, COUNT(*) as count 
      FROM sites 
      GROUP BY type 
      ORDER BY type
    `);
    
    console.log('🏠 Sites by Type:');
    siteCounts.forEach(row => {
      console.log(`  ${row.type}: ${row.count}`);
    });
    
    // Reservation stats
    const reservationStats = await db.get(`
      SELECT 
        COUNT(*) as total_reservations,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        SUM(total_cost) as total_revenue
      FROM reservations
    `);
    
    console.log('\n📋 Reservations:');
    console.log(`  Total: ${reservationStats.total_reservations}`);
    console.log(`  Confirmed: ${reservationStats.confirmed}`);
    console.log(`  Pending: ${reservationStats.pending}`);
    console.log(`  Cancelled: ${reservationStats.cancelled}`);
    console.log(`  Total Revenue: $${(reservationStats.total_revenue || 0).toFixed(2)}`);
    
    // Upcoming reservations (next 7 days)
    const upcomingReservations = await db.all(`
      SELECT site_name, guest_name, check_in, check_out, guests, total_cost
      FROM reservations 
      WHERE check_in >= date('now') 
        AND check_in <= date('now', '+7 days')
        AND status = 'confirmed'
      ORDER BY check_in
      LIMIT 10
    `);
    
    if (upcomingReservations.length > 0) {
      console.log('\n📅 Upcoming Reservations (Next 7 Days):');
      console.log('Site                     | Guest           | Check-in   | Guests | Cost');
      console.log('-------------------------|-----------------|------------|--------|--------');
      upcomingReservations.forEach(res => {
        console.log(`${res.site_name.padEnd(25)} | ${res.guest_name.padEnd(15)} | ${res.check_in} | ${String(res.guests).padEnd(6)} | $${res.total_cost.toFixed(2)}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    process.exit(1);
  }
}

async function clearReservations() {
  try {
    await initializeDatabase();
    const db = getDatabase();
    
    const result = await db.run('DELETE FROM reservations');
    await db.run('DELETE FROM site_availability');
    
    console.log(`✅ Cleared ${result.changes} reservations and all availability data`);
    
  } catch (error) {
    console.error('❌ Error clearing reservations:', error);
    process.exit(1);
  }
}

async function showHelp() {
  console.log(`
🛠️  Pine Ridge Hot Springs - Admin Tools

Usage: node admin.js <command> [options]

Commands:
  reset                    - Clear database and recreate tables
  seed                     - Populate database with sample sites and reservations
  clear-reservations       - Clear all reservations but keep sites
  populate <percentage>    - Set occupancy for next 30 days (0-100%)
  stats                    - Show database statistics
  help                     - Show this help message

Examples:
  node admin.js reset                    # Reset database completely
  node admin.js seed                     # Add sample data
  node admin.js populate 50              # Set 50% occupancy for next 30 days
  node admin.js populate 80              # Set 80% occupancy for next 30 days
  node admin.js populate 99              # Set 99% occupancy for next 30 days
  node admin.js clear-reservations       # Clear reservations only
  node admin.js stats                    # Show current statistics

Combined workflows:
  node admin.js reset && node admin.js seed && node admin.js populate 80
    ↳ Complete reset with 80% occupancy for testing

💡 Quick occupancy setup:
  npm run admin populate 50             # 50% occupancy
  npm run admin populate 80             # 80% occupancy  
  npm run admin populate 99             # 99% occupancy
`);
}

// Main command handler
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'help') {
    await showHelp();
    return;
  }
  
  switch (command) {
    case 'reset':
      await resetDatabase();
      break;
      
    case 'seed':
      await seedDatabase();
      break;
      
    case 'clear-reservations':
      await clearReservations();
      break;
      
    case 'populate':
      const percentage = parseInt(args[1]);
      if (!percentage || percentage < 0 || percentage > 100) {
        console.log('❌ Please provide a valid occupancy percentage (0-100)');
        console.log('Example: node admin.js populate 80');
        process.exit(1);
      }
      await populateOccupancy(percentage);
      break;
      
    case 'stats':
      await showStats();
      break;
      
    default:
      console.log(`❌ Unknown command: ${command}`);
      console.log('Run "node admin.js help" for available commands');
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Admin tool error:', error);
    process.exit(1);
  });
}

module.exports = {
  resetDatabase,
  seedDatabase, 
  populateOccupancy,
  showStats,
  clearReservations
};