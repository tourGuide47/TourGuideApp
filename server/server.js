const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'assets', 'www')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/places', require('./routes/places'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/owner', require('./routes/owner'));

// Init DB then start server
async function start() {
  try {
    await initDB();
    console.log('✅ TourGuide Ghardaia Database initialized');
    app.listen(PORT, () => {
      console.log(`\n🌍 App Backend running on http://localhost:${PORT}`);
      console.log(`📍 API Base: http://localhost:${PORT}/api\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
