const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../models/database');
const { sendConfirmationEmail } = require('../utils/email');
const { validateReservation } = require('../utils/validation');
const router = express.Router();

// Create a new reservation
router.post('/', async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Validate the booking data
    const validation = validateReservation(bookingData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      });
    }
    
    const db = getDatabase();
    
    // Check if site exists and get site info
    const site = await db.get('SELECT * FROM sites WHERE id = ?', [bookingData.siteId]);
    if (!site) {
      return res.status(404).json({
        success: false,
        error: 'Site not found'
      });
    }
    
    // Check capacity
    if (bookingData.guests > site.capacity) {
      return res.status(400).json({
        success: false,
        error: `Site capacity exceeded. Maximum capacity is ${site.capacity} guests.`
      });
    }
    
    // Check availability
    const conflictingReservations = await db.all(`
      SELECT id FROM reservations 
      WHERE site_id = ? 
        AND status != 'cancelled'
        AND check_in < ?
        AND check_out > ?
    `, [
      bookingData.siteId,
      bookingData.checkOut,
      bookingData.checkIn
    ]);
    
    if (conflictingReservations.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Site is not available for the selected dates'
      });
    }
    
    // Calculate total cost
    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalCost = nights * site.price;
    
    // Generate reservation ID and verification token
    const reservationId = uuidv4();
    const verificationToken = uuidv4();
    
    // Create reservation
    await db.run(`
      INSERT INTO reservations (
        id, site_id, site_name, guest_name, guest_email, guest_phone,
        check_in, check_out, guests, total_cost, special_requests,
        status, verification_token
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      reservationId,
      bookingData.siteId,
      site.name,
      bookingData.guestName,
      bookingData.guestEmail,
      bookingData.guestPhone,
      bookingData.checkIn,
      bookingData.checkOut,
      bookingData.guests,
      totalCost,
      bookingData.specialRequests || null,
      'pending',
      verificationToken
    ]);
    
    // Get the created reservation
    const reservation = await db.get('SELECT * FROM reservations WHERE id = ?', [reservationId]);
    
    // Send confirmation email
    try {
      await sendConfirmationEmail({
        ...reservation,
        siteName: site.name,
        siteType: site.type,
        nights,
        verificationToken
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the reservation if email fails
    }
    
    res.status(201).json({
      success: true,
      data: {
        id: reservation.id,
        siteId: reservation.site_id,
        siteName: reservation.site_name,
        guestName: reservation.guest_name,
        guestEmail: reservation.guest_email,
        guestPhone: reservation.guest_phone,
        checkIn: reservation.check_in,
        checkOut: reservation.check_out,
        guests: reservation.guests,
        totalCost: reservation.total_cost,
        specialRequests: reservation.special_requests,
        status: reservation.status,
        createdAt: reservation.created_at
      },
      message: 'Reservation created successfully. Please check your email for confirmation.'
    });
    
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create reservation'
    });
  }
});

// Get reservation by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const reservation = await db.get(`
      SELECT r.*, s.type as site_type, s.amenities, s.images
      FROM reservations r
      JOIN sites s ON r.site_id = s.id
      WHERE r.id = ?
    `, [id]);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      });
    }
    
    // Parse JSON fields from site and map field names to match frontend expectations
    const parsedReservation = {
      ...reservation,
      siteId: reservation.site_id,
      siteName: reservation.site_name,
      guestName: reservation.guest_name,
      guestEmail: reservation.guest_email,
      guestPhone: reservation.guest_phone,
      checkIn: reservation.check_in,
      checkOut: reservation.check_out,
      totalCost: reservation.total_cost,
      specialRequests: reservation.special_requests,
      verificationToken: reservation.verification_token,
      createdAt: reservation.created_at,
      updatedAt: reservation.updated_at,
      amenities: reservation.amenities ? JSON.parse(reservation.amenities) : [],
      images: reservation.images ? JSON.parse(reservation.images) : []
    };
    
    res.json({
      success: true,
      data: parsedReservation
    });
    
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reservation'
    });
  }
});

// Verify reservation email
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required'
      });
    }
    
    const db = getDatabase();
    
    const reservation = await db.get(`
      SELECT * FROM reservations 
      WHERE verification_token = ? AND status = 'pending'
    `, [token]);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }
    
    // Update reservation status to confirmed
    await db.run(`
      UPDATE reservations 
      SET status = 'confirmed', verification_token = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [reservation.id]);
    
    // Get updated reservation
    const updatedReservation = await db.get('SELECT * FROM reservations WHERE id = ?', [reservation.id]);
    
    // Map field names to match frontend expectations
    const mappedReservation = {
      ...updatedReservation,
      siteId: updatedReservation.site_id,
      siteName: updatedReservation.site_name,
      guestName: updatedReservation.guest_name,
      guestEmail: updatedReservation.guest_email,
      guestPhone: updatedReservation.guest_phone,
      checkIn: updatedReservation.check_in,
      checkOut: updatedReservation.check_out,
      totalCost: updatedReservation.total_cost,
      specialRequests: updatedReservation.special_requests,
      verificationToken: updatedReservation.verification_token,
      createdAt: updatedReservation.created_at,
      updatedAt: updatedReservation.updated_at
    };
    
    res.json({
      success: true,
      data: mappedReservation,
      message: 'Reservation confirmed successfully!'
    });
    
  } catch (error) {
    console.error('Error verifying reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify reservation'
    });
  }
});

// Cancel reservation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query; // Optional email verification
    
    const db = getDatabase();
    
    let reservation;
    if (email) {
      reservation = await db.get(`
        SELECT * FROM reservations 
        WHERE id = ? AND guest_email = ? AND status != 'cancelled'
      `, [id, email]);
    } else {
      reservation = await db.get(`
        SELECT * FROM reservations 
        WHERE id = ? AND status != 'cancelled'
      `, [id]);
    }
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found or already cancelled'
      });
    }
    
    // Check if cancellation is allowed (e.g., not past check-in date)
    const checkInDate = new Date(reservation.check_in);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate <= today) {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel reservation after check-in date'
      });
    }
    
    // Update reservation status
    await db.run(`
      UPDATE reservations 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Reservation cancelled successfully'
    });
    
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel reservation'
    });
  }
});

// Get reservations for a specific site
router.get('/site/:siteId', async (req, res) => {
  try {
    const { siteId } = req.params;
    const { status } = req.query; // Optional status filter
    
    const db = getDatabase();
    
    let query = `
      SELECT r.*, s.name as site_name, s.type as site_type
      FROM reservations r
      JOIN sites s ON r.site_id = s.id
      WHERE r.site_id = ?
    `;
    const params = [siteId];
    
    // Add status filter if provided
    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY r.check_in ASC';
    
    const reservations = await db.all(query, params);
    
    // Map field names to match frontend expectations
    const mappedReservations = reservations.map(reservation => ({
      ...reservation,
      siteId: reservation.site_id,
      siteName: reservation.site_name,
      guestName: reservation.guest_name,
      guestEmail: reservation.guest_email, 
      guestPhone: reservation.guest_phone,
      checkIn: reservation.check_in,
      checkOut: reservation.check_out,
      totalCost: reservation.total_cost,
      specialRequests: reservation.special_requests,
      verificationToken: reservation.verification_token,
      createdAt: reservation.created_at,
      updatedAt: reservation.updated_at
    }));
    
    res.json({
      success: true,
      data: mappedReservations
    });
    
  } catch (error) {
    console.error('Error fetching site reservations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch site reservations'
    });
  }
});

module.exports = router;