const express = require('express');
const middleware = require('./middleware');
const routes = require('./routes');

const app = express();

app.use(middleware.cors);
app.use(middleware.json);
app.use(middleware.urlencoded);

app.use(routes);

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;

