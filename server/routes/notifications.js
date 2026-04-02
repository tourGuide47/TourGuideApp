const express = require('express');
const router = express.Router();
const { queryAll, runSQL } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// Get my notifications
router.get('/', authenticateToken, (req, res) => {
  res.json(queryAll('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]));
});

// Mark as read
router.post('/read/:id', authenticateToken, (req, res) => {
  runSQL('UPDATE notifications SET is_read = 1 WHERE message_id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'Marked as read' });
});

module.exports = router;
