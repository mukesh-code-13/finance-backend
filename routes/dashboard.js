const express = require('express');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get dashboard summary (viewer, analyst, admin)
router.get('/', authenticate, authorize(['viewer', 'analyst', 'admin']), (req, res) => {
  db.get(`
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
    FROM records 
    WHERE user_id = ?
  `, [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const summary = {
      total_income: row?.total_income || 0,
      total_expense: row?.total_expense || 0,
      balance: (row?.total_income || 0) - (row?.total_expense || 0)
    };
    res.json(summary);
  });
});

module.exports = router;
