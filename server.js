const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const ipWhitelist = require('./middleware/ipWhitelist');
app.use(ipWhitelist);

const userRoutes = require('./routes/users');
const recordRoutes = require('./routes/records');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.\n` +
      'Tip: run `lsof -i :' + PORT + '` then `kill <PID>` or use another port with `PORT=4000 npm start`.');
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});

module.exports = app;
