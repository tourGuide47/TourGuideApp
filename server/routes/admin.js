const express = require('express');
const router = express.Router();
const { queryAll, queryOne, runSQL } = require('../database/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get stats
router.get('/stats', authenticateToken, isAdmin, (req, res) => {
  try {
    const placesCount = queryOne('SELECT COUNT(*) as count FROM places').count;
    const usersCount = queryOne('SELECT COUNT(*) as count FROM users').count;
    const reviewsCount = queryOne('SELECT COUNT(*) as count FROM reviews').count;
    const bookingsCount = queryOne('SELECT COUNT(*) as count FROM bookings').count;
    
    res.json({
      places: placesCount,
      users: usersCount,
      reviews: reviewsCount,
      bookings: bookingsCount,
      recentActivity: queryAll('SELECT * FROM admin_activities ORDER BY created_at DESC LIMIT 5')
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Manage places
router.get('/places', authenticateToken, isAdmin, (req, res) => {
  res.json(queryAll('SELECT * FROM places'));
});

router.post('/places', authenticateToken, isAdmin, (req, res) => {
  const { name, category, description, address } = req.body;
  try {
    const result = runSQL('INSERT INTO places (name, category, description, address) VALUES (?,?,?,?)', [name, category, description, address]);
    res.status(201).json({ id: result.lastId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create place' });
  }
});

module.exports = router;
