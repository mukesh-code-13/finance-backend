const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Register user (admin only)
router.post('/register', authenticate, authorize(['admin']), async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: 'All fields required' });
  const hashedPassword = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], function(err) {
    if (err) return res.status(400).json({ error: 'User already exists' });
    res.status(201).json({ id: this.lastID });
  });
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, 'secretkey');
    res.json({ token });
  });
});

// Get users (admin)
router.get('/', authenticate, authorize(['admin']), (req, res) => {
  db.all('SELECT id, username, role, status FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Update user status (admin)
router.put('/:id/status', authenticate, authorize(['admin']), (req, res) => {
  const { status } = req.body;
  db.run('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Updated' });
  });
});

module.exports = router;
