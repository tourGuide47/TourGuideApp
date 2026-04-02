const express = require('express');
const router = express.Router();
const { queryAll, queryOne, runSQL } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// Get my place info
router.get('/my-place', authenticateToken, (req, res) => {
  const place = queryOne('SELECT p.* FROM places p JOIN business_owners bo ON p.place_id = bo.place_id WHERE bo.user_id = ?', [req.user.id]);
  if (!place) return res.status(404).json({ error: 'No business assigned' });
  res.json(place);
});

// Update my place info
router.put('/my-business', authenticateToken, (req, res) => {
  const p = queryOne('SELECT place_id FROM business_owners WHERE user_id = ?', [req.user.id]);
  if (!p) return res.status(403).json({ error: 'No business assigned' });
  
  const { name, name_ar, description_ar, phone, website, opening_hours } = req.body;
  runSQL('UPDATE places SET name=?, name_ar=?, description_ar=?, phone=?, website=?, opening_hours=? WHERE place_id=?',
    [name, name_ar, description_ar, phone, website, opening_hours, p.place_id]);
  res.json({ success: true });
});

// Get business full details + stats
router.get('/my-business', authenticateToken, (req, res) => {
  const place = queryOne('SELECT p.* FROM places p JOIN business_owners bo ON p.place_id = bo.place_id WHERE bo.user_id = ?', [req.user.id]);
  if (!place) return res.status(404).json({ error: 'No business assigned' });
  
  const reviewsCount = queryOne('SELECT COUNT(*) as count, AVG(rating) as avg FROM reviews WHERE place_id=?', [place.place_id]);
  const bookingsCount = queryOne('SELECT COUNT(*) as count FROM bookings WHERE place_id=?', [place.place_id]);
  
  res.json({
    business: place,
    stats: {
      views: place.views,
      reviews: reviewsCount.count,
      avg_rating: reviewsCount.avg,
      bookings: bookingsCount.count
    }
  });
});

// Get my reviews
router.get('/reviews', authenticateToken, (req, res) => {
  const p = queryOne('SELECT place_id FROM business_owners WHERE user_id = ?', [req.user.id]);
  if (!p) return res.json([]);
  const reviews = queryAll('SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.user_id WHERE r.place_id = ? ORDER BY r.created_at DESC', [p.place_id]);
  res.json(reviews);
});

// Reply to review
router.post('/reviews/:id/reply', authenticateToken, (req, res) => {
  const { reply_text } = req.body;
  const p = queryOne('SELECT place_id FROM business_owners WHERE user_id = ?', [req.user.id]);
  if (!p) return res.status(403).json({ error: 'Unauthorized' });
  runSQL('UPDATE reviews SET reply_text=?, replied_at=CURRENT_TIMESTAMP WHERE review_id=? AND place_id=?', [reply_text, req.params.id, p.place_id]);
  res.json({ success: true });
});

// Get my menu (rooms or dishes)
router.get('/menu', authenticateToken, (req, res) => {
  const p = queryOne('SELECT place_id FROM business_owners WHERE user_id = ?', [req.user.id]);
  if (!p) return res.json([]);
  res.json(queryAll('SELECT * FROM menu_items WHERE place_id = ? ORDER BY created_at DESC', [p.place_id]));
});

// Add new menu item (room or dish)
router.post('/menu', authenticateToken, (req, res) => {
  const p = queryOne('SELECT place_id FROM business_owners WHERE user_id = ?', [req.user.id]);
  if (!p) return res.status(403).json({ error: 'Unauthorized' });
  
  const { name, price, type, description, image_url } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Missing name or price' });
  
  const result = runSQL('INSERT INTO menu_items (place_id, name, price, type, description, image_url) VALUES (?, ?, ?, ?, ?, ?)', 
    [p.place_id, name, price, type || '', description, image_url || '']);
  
  res.json({ success: true, item_id: result.lastId });
});

// Delete menu item
router.delete('/menu/:id', authenticateToken, (req, res) => {
  const p = queryOne('SELECT place_id FROM business_owners WHERE user_id = ?', [req.user.id]);
  if (!p) return res.status(403).json({ error: 'Unauthorized' });
  
  const item = queryOne('SELECT * FROM menu_items WHERE item_id = ? AND place_id = ?', [req.params.id, p.place_id]);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  
  runSQL('DELETE FROM menu_items WHERE item_id = ? AND place_id = ?', [req.params.id, p.place_id]);
  res.json({ success: true });
});

// Get menu by ID (public)
router.get('/menu/:id', (req, res) => {
  res.json(queryAll('SELECT * FROM menu_items WHERE place_id = ?', [req.params.id]));
});

// Get my bookings
router.get('/bookings', authenticateToken, (req, res) => {
  const p = queryOne('SELECT place_id FROM business_owners WHERE user_id = ?', [req.user.id]);
  if (!p) return res.status(403).json({ error: 'No business assigned' });
  res.json(queryAll('SELECT b.*, u.name as user_name FROM bookings b JOIN users u ON b.user_id = u.user_id WHERE b.place_id = ? ORDER BY b.booking_date DESC', [p.place_id]));
});

module.exports = router;
