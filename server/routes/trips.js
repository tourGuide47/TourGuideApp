const express = require('express');
const router = express.Router();
const { queryAll, runSQL, queryOne } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// Get my trips
router.get('/', authenticateToken, (req, res) => {
  res.json(queryAll('SELECT * FROM trips WHERE user_id = ?', [req.user.id]));
});

// Create trip
router.post('/', authenticateToken, (req, res) => {
  const { trip_name, start_date, end_date, notes } = req.body;
  try {
    const result = runSQL('INSERT INTO trips (user_id, trip_name, start_date, end_date, notes) VALUES (?,?,?,?,?)', [req.user.id, trip_name, start_date || null, end_date || null, notes || '']);
    res.status(201).json({ id: result.lastId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

// Delete trip
router.delete('/:id', authenticateToken, (req, res) => {
  runSQL('DELETE FROM trips WHERE trip_id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'Trip deleted' });
});

module.exports = router;
