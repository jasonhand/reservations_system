const { initializeDatabase, getDatabase } = require('../models/database');

// Generate dates for the next 30 days
function getNext30Days() {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD format
  }
  
  return dates;
}

// Generate random reservations based on occupancy percentage
async function generateReservations(siteId, siteName, dates, occupancyPercent, sitePrice) {
  const reservations = [];
  const totalDays = dates.length;
  const occupiedDays = Math.floor(totalDays * (occupancyPercent / 100));
  
  // Randomly select which days will be occupied
  const shuffledDates = [...dates].sort(() => Math.random() - 0.5);
  const occupiedDates = shuffledDates.slice(0, occupiedDays);
  
  // Create reservations (some spanning multiple days)
  const sortedOccupiedDates = occupiedDates.sort();
  let i = 0;
  let reservationId = 1;
  
  while (i < sortedOccupiedDates.length) {
    const checkIn = sortedOccupiedDates[i];
    
    // Randomly decide length of stay (1-4 days, weighted toward shorter stays)
    const rand = Math.random();
    let stayLength;
    if (rand < 0.5) stayLength = 1;      // 50% chance of 1 day
    else if (rand < 0.8) stayLength = 2;  // 30% chance of 2 days  
    else if (rand < 0.95) stayLength = 3; // 15% chance of 3 days
    else stayLength = 4;                  // 5% chance of 4 days
    
    // Calculate check-out date
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + stayLength);
    const checkOut = checkOutDate.toISOString().split('T')[0];
    
    // Generate guest info
    const guestNames = [
      'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
      'Jessica Miller', 'Christopher Jones', 'Amanda Garcia', 'Matthew Rodriguez', 'Ashley Martinez',
      'Joshua Anderson', 'Stephanie Taylor', 'Andrew Thomas', 'Michelle Hernandez', 'Daniel Moore'
    ];
    
    const guestName = guestNames[Math.floor(Math.random() * guestNames.length)];
    const guestEmail = `${guestName.toLowerCase().replace(' ', '.')}@example.com`;
    const guestPhone = `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const guests = Math.floor(Math.random() * 4) + 1; // 1-4 guests
    
    reservations.push({
      id: `${siteId}-res-${reservationId++}`,
      site_id: siteId,
      site_name: siteName,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      check_in: checkIn,
      check_out: checkOut,
      guests: guests,
      total_cost: sitePrice * stayLength,
      status: 'confirmed',
      special_requests: null
    });
    
    // Skip ahead past this reservation
    i++;
    while (i < sortedOccupiedDates.length && sortedOccupiedDates[i] < checkOut) {
      i++;
    }
  }
  
  return reservations;
}

async function populateOccupancy(occupancyPercent) {
  try {
    console.log(`🏕️  Setting occupancy to ${occupancyPercent}% for next 30 days...`);
    
    await initializeDatabase();
    const db = getDatabase();
    
    // Get all sites
    const sites = await db.all('SELECT id, name, price FROM sites');
    console.log(`📋 Found ${sites.length} sites`);
    
    // Clear existing reservations
    await db.run('DELETE FROM reservations');
    await db.run('DELETE FROM site_availability');
    console.log('🗑️  Cleared existing reservations and availability');
    
    const dates = getNext30Days();
    const allReservations = [];
    
    // Generate reservations for each site
    for (const site of sites) {
      const reservations = await generateReservations(
        site.id, 
        site.name, 
        dates, 
        occupancyPercent, 
        site.price
      );
      allReservations.push(...reservations);
    }
    
    // Insert all reservations
    const insertReservation = `
      INSERT INTO reservations (
        id, site_id, site_name, guest_name, guest_email, guest_phone,
        check_in, check_out, guests, total_cost, status, special_requests
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    for (const reservation of allReservations) {
      await db.run(insertReservation, [
        reservation.id,
        reservation.site_id,
        reservation.site_name,
        reservation.guest_name,
        reservation.guest_email,
        reservation.guest_phone,
        reservation.check_in,
        reservation.check_out,
        reservation.guests,
        reservation.total_cost,
        reservation.status,
        reservation.special_requests
      ]);
    }
    
    // Update site availability based on reservations
    for (const site of sites) {
      for (const date of dates) {
        // Check if site is reserved on this date
        const isReserved = allReservations.some(res => 
          res.site_id === site.id && 
          date >= res.check_in && 
          date < res.check_out
        );
        
        await db.run(
          'INSERT OR REPLACE INTO site_availability (site_id, date, available) VALUES (?, ?, ?)',
          [site.id, date, isReserved ? 0 : 1]
        );
      }
    }
    
    console.log(`✅ Successfully created ${allReservations.length} reservations`);
    console.log(`📊 Occupancy set to approximately ${occupancyPercent}% for next 30 days`);
    
    // Show summary
    const summary = await db.all(`
      SELECT s.name, s.type, COUNT(r.id) as reservation_count
      FROM sites s
      LEFT JOIN reservations r ON s.id = r.site_id
      GROUP BY s.id, s.name, s.type
      ORDER BY s.type, s.name
    `);
    
    console.log('\n📈 Reservation Summary:');
    console.log('Site Name                    | Type     | Reservations');
    console.log('----------------------------|----------|-------------');
    summary.forEach(row => {
      console.log(`${row.name.padEnd(28)} | ${row.type.padEnd(8)} | ${row.reservation_count}`);
    });
    
  } catch (error) {
    console.error('❌ Error populating occupancy:', error);
    process.exit(1);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const occupancyPercent = parseInt(args[0]);
  
  if (!occupancyPercent || occupancyPercent < 0 || occupancyPercent > 100) {
    console.log('Usage: node populate-occupancy.js <occupancy_percentage>');
    console.log('Example: node populate-occupancy.js 80');
    console.log('Occupancy percentage must be between 0 and 100');
    process.exit(1);
  }
  
  populateOccupancy(occupancyPercent);
}

module.exports = { populateOccupancy };