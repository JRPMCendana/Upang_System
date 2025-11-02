const database = require('../config/database');

class HealthController {
  static getHealth(req, res) {
    const dbStatus = database.isConnected() ? 'connected' : 'disconnected';
    
    res.json({ 
      status: 'OK', 
      message: 'Server is running',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = HealthController;

