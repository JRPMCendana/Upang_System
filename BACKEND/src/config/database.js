const mongoose = require('mongoose');
const config = require('./config');

class Database {
  constructor() {
    this.connection = null;
    this.maxRetries = 5;
    this.retryDelay = 5000; 
    this.isConnecting = false;
  }


  async connect(retryCount = 0) {
    try {

      if (this.isConnecting) {
        console.log('Connection attempt already in progress...');
        return null;
      }

      if (mongoose.connection.readyState === 1) {
        console.log('MongoDB already connected');
        return mongoose.connection;
      }

      this.isConnecting = true;

      const connectionOptions = {
        ...config.database.options,
        serverSelectionTimeoutMS: 10000, 
        socketTimeoutMS: 45000, 
        family: 4 
      };

      this.connection = await mongoose.connect(
        config.database.uri,
        connectionOptions
      );


      this.isConnecting = false;
      this.setupEventHandlers();

      return this.connection;
    } catch (error) {
      this.isConnecting = false;
      return this.handleConnectionError(error, retryCount);
    }
  }

  async handleConnectionError(error, retryCount) {
    const errorType = this.identifyErrorType(error);
    
    console.error(`\nMongoDB Connection Failed (Attempt ${retryCount + 1}/${this.maxRetries + 1})`);
    console.error(`   Error Type: ${errorType.type}`);
    console.error(`   Description: ${errorType.description}`);
    
    if (config.nodeEnv === 'development') {
      console.error(`   Technical Details: ${error.message}`);
    }

    console.log(`\nTroubleshooting Steps:`);
    errorType.solutions.forEach((solution, index) => {
      console.log(`   ${index + 1}. ${solution}`);
    });

    if (retryCount < this.maxRetries) {
      const delay = this.retryDelay * Math.pow(2, retryCount); 
      console.log(`\nRetrying in ${delay / 1000} seconds...\n`);
      
      await this.sleep(delay);
      return this.connect(retryCount + 1);
    }

    console.error(`\nMax retry attempts (${this.maxRetries}) exceeded.`);
    console.error(`Server will start WITHOUT database connection.`);
    console.error(`API endpoints requiring database will not function.\n`);

    return null;
  }

  identifyErrorType(error) {
    const errorCode = error.code || error.syscall;
    const errorMessage = error.message.toLowerCase();

    if (errorCode === 'ETIMEOUT' || errorMessage.includes('timeout')) {
      return {
        type: 'DNS/Network Timeout',
        description: 'Unable to resolve MongoDB hostname or network timeout',
        solutions: [
          'Check your internet connection',
          'Verify your DNS settings (try using Google DNS: 8.8.8.8, 8.8.4.4)',
          'Disable VPN if you\'re using one',
          'Check if your firewall is blocking MongoDB ports (27017)',
          'Wait a moment and try again (network might be congested)'
        ]
      };
    }

    if (errorCode === 'ENOTFOUND') {
      return {
        type: 'DNS Resolution Failed',
        description: 'Cannot find the MongoDB server hostname',
        solutions: [
          'Verify your MONGODB_URI in .env file is correct',
          'Check your DNS server configuration',
          'Try flushing DNS cache: ipconfig /flushdns (Windows)',
          'Check if MongoDB Atlas cluster is running'
        ]
      };
    }

    if (errorMessage.includes('authentication') || errorMessage.includes('auth')) {
      return {
        type: 'Authentication Error',
        description: 'Invalid database credentials',
        solutions: [
          'Verify your MongoDB username and password in MONGODB_URI',
          'Check if database user has proper permissions',
          'Ensure password doesn\'t contain special characters (or properly URL-encoded)',
          'Verify IP whitelist in MongoDB Atlas includes your IP'
        ]
      };
    }

    if (errorMessage.includes('econnrefused')) {
      return {
        type: 'Connection Refused',
        description: 'MongoDB server refused the connection',
        solutions: [
          'Verify MongoDB server is running',
          'Check if the port (27017) is correct',
          'Ensure your IP is whitelisted in MongoDB Atlas',
          'Check network/firewall settings'
        ]
      };
    }

    return {
      type: 'Unknown Error',
      description: error.message,
      solutions: [
        'Check MongoDB Atlas dashboard for service status',
        'Verify all environment variables are set correctly',
        'Review MongoDB connection string format',
        'Check server logs for more details'
      ]
    };
  }

  setupEventHandlers() {
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB runtime error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    process.on('SIGINT', this.gracefulShutdown.bind(this, 'SIGINT'));
    process.on('SIGTERM', this.gracefulShutdown.bind(this, 'SIGTERM'));
  }

  async gracefulShutdown(signal) {
    console.log(`\n${signal} received. Closing MongoDB connection...`);
    await this.disconnect();
    process.exit(0);
  }

  maskConnectionString(uri) {
    try {
      return uri.replace(/\/\/([^:]+):([^@]+)@/, '//*****:*****@');
    } catch {
      return 'mongodb://***hidden***';
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  async disconnect() {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
      }
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }

  getConnection() {
    return mongoose.connection;
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = new Database();

