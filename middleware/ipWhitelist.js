const ipWhitelist = (req, res, next) => {
  // For development: allow all IPs. In production, add IP checks.
  next();
};

module.exports = ipWhitelist;
