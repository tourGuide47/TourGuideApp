const express = require('express');
const router = express.Router();
const { queryAll, runSQL } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// Get for place
router.get('/place/:id', (req, res) => {
  res.json(queryAll('SELECT * FROM reviews WHERE place_id = ?', [req.params.id]));
});

// Add review
router.post('/', authenticateToken, (req, res) => {
  const { place_id, rating, comment } = req.body;
  try {
    const result = runSQL('INSERT INTO reviews (user_id, place_id, rating, comment) VALUES (?,?,?,?)', [req.user.id, place_id, rating, comment]);
    res.status(201).json({ id: result.lastId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add review' });
  }
});

module.exports = router;
