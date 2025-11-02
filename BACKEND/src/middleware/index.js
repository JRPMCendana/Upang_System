const corsMiddleware = require('./cors.middleware');
const express = require('express');

module.exports = {
  cors: corsMiddleware,
  json: express.json(),
  urlencoded: express.urlencoded({ extended: true })
};

