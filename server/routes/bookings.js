const express = require('express');
const router = express.Router();
const { queryAll, runSQL, queryOne } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// Get my bookings
router.get('/', authenticateToken, (req, res) => {
  res.json(queryAll('SELECT b.*, p.name FROM bookings b JOIN places p ON b.place_id = p.place_id WHERE b.user_id = ?', [req.user.id]));
});

// Create booking
router.post('/', authenticateToken, (req, res) => {
  const { place_id, booking_date, booking_time, guests } = req.body;
  try {
    const result = runSQL('INSERT INTO bookings (user_id, place_id, booking_date, booking_time, guests) VALUES (?,?,?,?,?)', [req.user.id, place_id, booking_date, booking_time || '12:00', guests || 1]);
    res.status(201).json({ id: result.lastId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

module.exports = router;
