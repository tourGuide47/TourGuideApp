const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryOne, runSQL } = require('../database/db');

const JWT_SECRET = 'tourguide_ghardaia_secret_key_2024';

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  try {
    const user = queryOne('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'عذراً، البريد الإلكتروني غير مسجل لدينا' });

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى' });

    const token = jwt.sign({ 
      userId: user.user_id, 
      email: user.email, 
      role: user.role 
    }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      token, 
      user: { 
        id: user.user_id, 
        user_id: user.user_id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً' });
  }
});

// Signup / Register Alias
router.post(['/signup', '/register'], (req, res) => {
  const { name, email, password, role = 'tourist' } = req.body;
  try {
    const hashed = bcrypt.hashSync(password, 10);
    const result = runSQL('INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)', [name, email, hashed, role]);
    
    // Generate token for immediate login after signup
    const user = {
      user_id: result.lastId,
      name,
      email,
      role
    };

    const token = jwt.sign({ 
      userId: user.user_id, 
      email: user.email, 
      role: user.role 
    }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ 
      message: 'User created successfully', 
      token, 
      user: { 
        id: user.user_id, 
        user_id: user.user_id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'البريد الإلكتروني موجود بالفعل' });
    }
    res.status(500).json({ error: 'فشل في إنشاء الحساب' });
  }
});

module.exports = router;
