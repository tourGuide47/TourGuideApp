const express = require('express');
const router = express.Router();
const { queryAll, queryOne } = require('../database/db');

// Get all places
router.get('/', (req, res) => {
  try {
    const places = queryAll('SELECT * FROM places ORDER BY created_at DESC');
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

// Get single place
router.get('/:id', (req, res) => {
  try {
    const place = queryOne('SELECT * FROM places WHERE place_id = ?', [req.params.id]);
    if (!place) return res.status(404).json({ error: 'Place not found' });
    res.json(place);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get by category
router.get('/category/:category', (req, res) => {
  try {
    const places = queryAll('SELECT * FROM places WHERE category = ?', [req.params.category]);
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch places by category' });
  }
});

module.exports = router;
