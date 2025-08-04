const express = require('express');
const { getDatabase } = require('../models/database');
const router = express.Router();

// Simple authentication middleware (for demo purposes)
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization required'
    });
  }
  
  const token = authHeader.substring(7);
  
  // Simple token validation (in production, use proper JWT verification)
  if (token !== 'admin-demo-token-2024') {
    return res.status(401).json({
      success: false,
      error: 'Invalid authorization token'
    });
  }
  
  next();
};

// Admin login (demo endpoint)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Simple demo authentication - use environment variable for production
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@pineridgehotsprings.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (email === adminEmail && password === adminPassword) {
    res.json({
      success: true,
      data: {
        token: 'admin-demo-token-2024',
        user: {
          email: 'admin@pineridgehotsprings.com',
          role: 'admin'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Get all reservations with filters
router.get('/reservations', authenticate, async (req, res) => {
  try {
    const { status, startDate, endDate, siteType } = req.query;
    const db = getDatabase();
    
    let query = `
      SELECT r.*, s.type as site_type, s.price as site_price
      FROM reservations r
      JOIN sites s ON r.site_id = s.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }
    
    if (startDate) {
      query += ' AND r.check_in >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.check_out <= ?';
      params.push(endDate);
    }
    
    if (siteType) {
      query += ' AND s.type = ?';
      params.push(siteType);
    }
    
    query += ' ORDER BY r.created_at DESC';
    
    const reservations = await db.all(query, params);
    
    res.json({
      success: true,
      data: reservations
    });
    
  } catch (error) {
    console.error('Error fetching admin reservations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reservations'
    });
  }
});

// Get reservation statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const db = getDatabase();
    
    // Get current month stats
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
    
    const stats = await Promise.all([
      // Total reservations
      db.get('SELECT COUNT(*) as count FROM reservations'),
      
      // Reservations by status
      db.all('SELECT status, COUNT(*) as count FROM reservations GROUP BY status'),
      
      // Current month revenue
      db.get(`
        SELECT SUM(total_cost) as revenue 
        FROM reservations 
        WHERE status = 'confirmed' 
          AND strftime('%Y-%m', created_at) = ?
      `, [currentMonth]),
      
      // Upcoming check-ins (next 7 days)
      db.get(`
        SELECT COUNT(*) as count 
        FROM reservations 
        WHERE status = 'confirmed' 
          AND check_in BETWEEN date('now') AND date('now', '+7 days')
      `),
      
      // Site type popularity
      db.all(`
        SELECT s.type, COUNT(r.id) as bookings
        FROM sites s
        LEFT JOIN reservations r ON s.id = r.site_id AND r.status != 'cancelled'
        GROUP BY s.type
        ORDER BY bookings DESC
      `),
      
      // Recent activity (last 10 reservations)
      db.all(`
        SELECT r.id, r.guest_name, r.site_name, r.status, r.created_at
        FROM reservations r
        ORDER BY r.created_at DESC
        LIMIT 10
      `)
    ]);
    
    res.json({
      success: true,
      data: {
        totalReservations: stats[0].count,
        reservationsByStatus: stats[1],
        currentMonthRevenue: stats[2]?.revenue || 0,
        upcomingCheckIns: stats[3].count,
        siteTypePopularity: stats[4],
        recentActivity: stats[5]
      }
    });
    
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// Update reservation status
router.patch('/reservations/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be pending, confirmed, or cancelled'
      });
    }
    
    const db = getDatabase();
    
    // Check if reservation exists
    const reservation = await db.get('SELECT * FROM reservations WHERE id = ?', [id]);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      });
    }
    
    // Update status
    await db.run(`
      UPDATE reservations 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, id]);
    
    // Get updated reservation
    const updatedReservation = await db.get('SELECT * FROM reservations WHERE id = ?', [id]);
    
    res.json({
      success: true,
      data: updatedReservation,
      message: `Reservation status updated to ${status}`
    });
    
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update reservation status'
    });
  }
});

// Get site occupancy calendar
router.get('/occupancy', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const db = getDatabase();
    
    // Default to current month if no dates provided
    const start = startDate || new Date().toISOString().split('T')[0];
    const end = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const occupancyData = await db.all(`
      SELECT 
        s.id as site_id,
        s.name as site_name,
        s.type as site_type,
        r.check_in,
        r.check_out,
        r.guest_name,
        r.status
      FROM sites s
      LEFT JOIN reservations r ON s.id = r.site_id 
        AND r.status != 'cancelled'
        AND r.check_in <= ? 
        AND r.check_out >= ?
      ORDER BY s.type, s.name, r.check_in
    `, [end, start]);
    
    // Group by site
    const occupancyBySite = {};
    occupancyData.forEach(row => {
      if (!occupancyBySite[row.site_id]) {
        occupancyBySite[row.site_id] = {
          siteId: row.site_id,
          siteName: row.site_name,
          siteType: row.site_type,
          reservations: []
        };
      }
      
      if (row.check_in) {
        occupancyBySite[row.site_id].reservations.push({
          checkIn: row.check_in,
          checkOut: row.check_out,
          guestName: row.guest_name,
          status: row.status
        });
      }
    });
    
    res.json({
      success: true,
      data: {
        startDate: start,
        endDate: end,
        sites: Object.values(occupancyBySite)
      }
    });
    
  } catch (error) {
    console.error('Error fetching occupancy data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch occupancy data'
    });
  }
});

module.exports = router;