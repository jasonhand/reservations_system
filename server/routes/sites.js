const express = require('express');
const { getDatabase } = require('../models/database');
const router = express.Router();

// Get all sites
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const sites = await db.all(`
      SELECT * FROM sites 
      ORDER BY type, price
    `);
    
    // Parse JSON fields
    const parsedSites = sites.map(site => ({
      ...site,
      amenities: JSON.parse(site.amenities),
      images: JSON.parse(site.images),
      features: JSON.parse(site.features)
    }));
    
    res.json({
      success: true,
      data: parsedSites
    });
  } catch (error) {
    console.error('Error fetching sites:', error);
    
    // If database is not available, return mock data
    if (error.message.includes('Database not initialized') || error.message.includes('ENOENT')) {
      console.log('Database not available, returning mock data');
      const mockSites = [
        {
          id: 'campsite-1',
          name: 'Riverside Retreat',
          type: 'campsite',
          capacity: 4,
          price: 45.00,
          amenities: ['Fire pit', 'Picnic table', 'Water access', 'Hot springs access'],
          description: 'A peaceful campsite nestled along the mountain stream.',
          images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3'],
          features: ['Stream-side location', 'Shaded area', '24/7 hot springs access'],
          size: '20x30 ft'
        },
        {
          id: 'cabin-1',
          name: 'Cozy Pine Cabin',
          type: 'cabin',
          capacity: 4,
          price: 120.00,
          amenities: ['Full kitchen', 'Private bathroom', 'Fireplace', 'Hot springs access'],
          description: 'Charming one-bedroom cabin with rustic charm.',
          images: ['/cabin_pics/cabin-01.jpg'],
          features: ['Wood-burning fireplace', 'Full kitchen', 'Private deck'],
          size: '600 sq ft',
          bedrooms: 1,
          bathrooms: 1
        }
      ];
      
      return res.json({
        success: true,
        data: mockSites
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sites'
    });
  }
});

// Get individual site availability for a specific month
router.get('/individual-availability', async (req, res) => {
  try {
    console.log('Individual availability request:', req.query);
    
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate are required'
      });
    }

    const db = getDatabase();

    // Get all sites
    const sites = await db.all('SELECT id, name FROM sites ORDER BY name');
    
    const siteAvailability = {};
    
    for (const site of sites) {
      // Count total days in the period
      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      
      // Count days with reservations (unavailable days)
      const reservations = await db.all(`
        SELECT check_in, check_out 
        FROM reservations 
        WHERE site_id = ? 
          AND status != 'cancelled'
          AND (
            (check_in <= ? AND check_out > ?) OR
            (check_in < ? AND check_out >= ?) OR
            (check_in >= ? AND check_in <= ?)
          )
      `, [site.id, endDate, startDate, endDate, startDate, startDate, endDate]);
      
      // Calculate unavailable days
      let unavailableDays = 0;
      const unavailableDates = new Set();
      
      for (const reservation of reservations) {
        const resStart = new Date(Math.max(new Date(reservation.check_in), start));
        const resEnd = new Date(Math.min(new Date(reservation.check_out), end));
        
        // Add each day of the reservation to the set
        for (let d = new Date(resStart); d < resEnd; d.setDate(d.getDate() + 1)) {
          unavailableDates.add(d.toISOString().split('T')[0]);
        }
      }
      
      unavailableDays = unavailableDates.size;
      const availableDays = totalDays - unavailableDays;
      
      siteAvailability[site.id] = {
        siteId: site.id,
        siteName: site.name,
        totalDays,
        availableDays,
        unavailableDays
      };
    }

    console.log('Site availability calculated:', Object.keys(siteAvailability).length, 'sites');

    res.json({
      success: true,
      data: siteAvailability,
      period: { startDate, endDate }
    });

  } catch (error) {
    console.error('Error getting individual site availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get site availability data'
    });
  }
});

// Get site by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const site = await db.get('SELECT * FROM sites WHERE id = ?', [id]);
    
    if (!site) {
      return res.status(404).json({
        success: false,
        error: 'Site not found'
      });
    }
    
    // Parse JSON fields
    const parsedSite = {
      ...site,
      amenities: JSON.parse(site.amenities),
      images: JSON.parse(site.images),
      features: JSON.parse(site.features)
    };
    
    res.json({
      success: true,
      data: parsedSite
    });
  } catch (error) {
    console.error('Error fetching site:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch site'
    });
  }
});

// Get available sites for date range
router.get('/available', async (req, res) => {
  try {
    const { checkIn, checkOut, guests, siteType } = req.query;
    
    if (!checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        error: 'Check-in date, check-out date, and number of guests are required'
      });
    }
    
    const db = getDatabase();
    
    // Build the query based on filters
    let query = `
      SELECT DISTINCT s.* 
      FROM sites s
      WHERE s.capacity >= ?
        AND s.id NOT IN (
          SELECT DISTINCT r.site_id 
          FROM reservations r 
          WHERE r.status != 'cancelled'
            AND (
              (r.check_in <= ? AND r.check_out > ?) OR
              (r.check_in < ? AND r.check_out >= ?) OR
              (r.check_in >= ? AND r.check_out <= ?)
            )
        )
    `;
    
    const params = [parseInt(guests), checkIn, checkIn, checkOut, checkOut, checkIn, checkOut];
    
    if (siteType) {
      query += ' AND s.type = ?';
      params.push(siteType);
    }
    
    query += ' ORDER BY s.type, s.price';
    
    const sites = await db.all(query, params);
    
    // Parse JSON fields
    const parsedSites = sites.map(site => ({
      ...site,
      amenities: JSON.parse(site.amenities),
      images: JSON.parse(site.images),
      features: JSON.parse(site.features)
    }));
    
    res.json({
      success: true,
      data: parsedSites
    });
    
  } catch (error) {
    console.error('Error fetching available sites:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available sites'
    });
  }
});

// Check site availability for specific dates
router.post('/:id/check-availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.body;
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        error: 'Check-in and check-out dates are required'
      });
    }
    
    const db = getDatabase();
    
    // Check if site exists
    const site = await db.get('SELECT id, name FROM sites WHERE id = ?', [id]);
    if (!site) {
      return res.status(404).json({
        success: false,
        error: 'Site not found'
      });
    }
    
    // Check for conflicting reservations
    const conflictingReservations = await db.all(`
      SELECT id FROM reservations 
      WHERE site_id = ? 
        AND status != 'cancelled'
        AND (
          (check_in <= ? AND check_out > ?) OR
          (check_in < ? AND check_out >= ?) OR
          (check_in >= ? AND check_out <= ?)
        )
    `, [id, checkIn, checkIn, checkOut, checkOut, checkIn, checkOut]);
    
    const isAvailable = conflictingReservations.length === 0;
    
    res.json({
      success: true,
      data: {
        siteId: id,
        siteName: site.name,
        checkIn,
        checkOut,
        available: isAvailable,
        conflictCount: conflictingReservations.length
      }
    });
    
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check availability'
    });
  }
});

// Get availability overview for calendar
router.get('/availability/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }
    
    const db = getDatabase();
    
    // Get total number of sites
    const totalSitesResult = await db.get('SELECT COUNT(*) as total FROM sites');
    const totalSites = totalSitesResult.total;
    
    // Get all reservations in the date range
    const reservations = await db.all(`
      SELECT check_in, check_out, site_id
      FROM reservations 
      WHERE status != 'cancelled'
        AND check_in <= ?
        AND check_out >= ?
      ORDER BY check_in
    `, [endDate, startDate]);
    
    
    // Generate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateAvailability = {};
    
    // Initialize all dates as fully available
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateAvailability[dateStr] = {
        date: dateStr,
        reservedSites: 0,
        availableSites: totalSites,
        status: 'available' // available, partial, full
      };
    }
    
    // Count reservations for each date
    reservations.forEach(reservation => {
      const checkIn = new Date(reservation.check_in);
      const checkOut = new Date(reservation.check_out);
      
      // Count this reservation for each date it spans
      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (dateAvailability[dateStr]) {
          dateAvailability[dateStr].reservedSites++;
          dateAvailability[dateStr].availableSites--;
        }
      }
    });
    
    // Set status for each date
    Object.values(dateAvailability).forEach(day => {
      if (day.reservedSites === 0) {
        day.status = 'available';
      } else if (day.reservedSites >= totalSites) {
        day.status = 'full';
      } else {
        day.status = 'partial';
      }
    });
    
    res.json({
      success: true,
      data: {
        totalSites,
        dateRange: { startDate, endDate },
        availability: Object.values(dateAvailability)
      }
    });
    
  } catch (error) {
    console.error('Error fetching availability overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch availability overview'
    });
  }
});

// Get availability calendar for a specific site
router.get('/:id/availability/calendar', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }
    
    const db = getDatabase();
    
    // Check if site exists
    const site = await db.get('SELECT id, name FROM sites WHERE id = ?', [id]);
    if (!site) {
      return res.status(404).json({
        success: false,
        error: 'Site not found'
      });
    }
    
    // Get all reservations for this site in the date range
    const reservations = await db.all(`
      SELECT check_in, check_out, guest_name, status
      FROM reservations 
      WHERE site_id = ?
        AND status != 'cancelled'
        AND check_in <= ?
        AND check_out >= ?
      ORDER BY check_in
    `, [id, endDate, startDate]);
    
    // Generate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateAvailability = {};
    
    // Initialize all dates as available
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateAvailability[dateStr] = {
        date: dateStr,
        available: true,
        reservation: null
      };
    }
    
    // Mark reserved dates
    reservations.forEach(reservation => {
      const checkIn = new Date(reservation.check_in);
      const checkOut = new Date(reservation.check_out);
      
      // Mark each date as reserved
      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (dateAvailability[dateStr]) {
          dateAvailability[dateStr].available = false;
          dateAvailability[dateStr].reservation = {
            guestName: reservation.guest_name,
            status: reservation.status,
            checkIn: reservation.check_in,
            checkOut: reservation.check_out
          };
        }
      }
    });
    
    res.json({
      success: true,
      data: {
        siteId: id,
        siteName: site.name,
        dateRange: { startDate, endDate },
        availability: Object.values(dateAvailability)
      }
    });
    
  } catch (error) {
    console.error('Error fetching site availability calendar:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch site availability calendar'
    });
  }
});

module.exports = router;