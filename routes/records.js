const express = require('express');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get records (viewer, analyst, admin)
router.get('/', authenticate, authorize(['viewer', 'analyst', 'admin']), (req, res) => {
  const { date, category, type } = req.query;
  let query = 'SELECT * FROM records WHERE user_id = ?';
  let params = [req.user.id];
  if (date) {
    query += ' AND date = ?';
    params.push(date);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Create record (analyst, admin)
router.post('/', authenticate, authorize(['analyst', 'admin']), (req, res) => {
  const { amount, type, category, date, notes } = req.body;
  if (!amount || !type || !category || !date) return res.status(400).json({ error: 'Required fields missing' });
  db.run('INSERT INTO records (user_id, amount, type, category, date, notes) VALUES (?, ?, ?, ?, ?, ?)', [req.user.id, amount, type, category, date, notes], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ id: this.lastID });
  });
});

// Update record (admin)
router.put('/:id', authenticate, authorize(['admin']), (req, res) => {
  const { amount, type, category, date, notes } = req.body;
  db.run('UPDATE records SET amount = ?, type = ?, category = ?, date = ?, notes = ? WHERE id = ? AND user_id = ?', [amount, type, category, date, notes, req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Updated' });
  });
});

// Delete record (admin)
router.delete('/:id', authenticate, authorize(['admin']), (req, res) => {
  db.run('DELETE FROM records WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Deleted' });
  });
});

module.exports = router;
