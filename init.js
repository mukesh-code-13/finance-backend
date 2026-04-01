const db = require('../db');

// Initialize default admin user if needed
db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
  if (row && row.count === 0) {
    const bcrypt = require('bcryptjs');
    const passwordHash = require('bcryptjs').hashSync('admin123', 10);
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
           ['admin', passwordHash, 'admin'], 
           (err) => {
             if (!err) console.log('Default admin user created');
           });
  }
});
