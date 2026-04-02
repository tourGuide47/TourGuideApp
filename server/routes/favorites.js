const express = require('express');
const router = express.Router();
const { queryAll, runSQL, queryOne } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// Get my favorites
router.get('/', authenticateToken, (req, res) => {
  res.json(queryAll('SELECT f.*, p.name, p.category, p.image_url FROM favorites f JOIN places p ON f.place_id = p.place_id WHERE f.user_id = ?', [req.user.id]));
});

// Add to favorites
router.post('/', authenticateToken, (req, res) => {
  const { place_id } = req.body;
  try {
    const existing = queryOne('SELECT * FROM favorites WHERE user_id = ? AND place_id = ?', [req.user.id, place_id]);
    if (existing) return res.status(409).json({ error: 'Already in favorites' });

    const result = runSQL('INSERT INTO favorites (user_id, place_id) VALUES (?,?)', [req.user.id, place_id]);
    res.status(201).json({ id: result.lastId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove
router.delete('/:id', authenticateToken, (req, res) => {
  runSQL('DELETE FROM favorites WHERE place_id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'Removed from favorites' });
});

module.exports = router;
