const mongoose = require('mongoose');
const config = require('./config');

class Database {
  constructor() {
    this.connection = null;
    this.maxRetries = 5;
    this.retryDelay = 5000; // Start with 5 seconds
    this.isConnecting = false;
  }

  /**
   * Connect to MongoDB with retry logic and comprehensive error handling
   */
  async connect(retryCount = 0) {
    try {
      // Prevent multiple simultaneous connection attempts
      if (this.isConnecting) {
        console.log('Connection attempt already in progress...');
        return null;
      }

      if (mongoose.connection.readyState === 1) {
        console.log('MongoDB already connected');
        return mongoose.connection;
      }

      this.isConnecting = true;

      // Validate MongoDB URI
      if (!config.database.uri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }

      console.log(`\nAttempting MongoDB connection... (Attempt ${retryCount + 1}/${this.maxRetries + 1})`);
      console.log(`Connecting to: ${this.maskConnectionString(config.database.uri)}`);

      const connectionOptions = {
        ...config.database.options,
        serverSelectionTimeoutMS: 10000, // 10 seconds timeout
        socketTimeoutMS: 45000, // 45 seconds socket timeout
        family: 4 // Use IPv4, skip trying IPv6
      };

      this.connection = await mongoose.connect(
        config.database.uri,
        connectionOptions
      );

      console.log(`MongoDB connected successfully!`);
      console.log(`   Host: ${mongoose.connection.host}`);
      console.log(`   Database: ${mongoose.connection.name}`);

      this.isConnecting = false;
      this.setupEventHandlers();

      return this.connection;
    } catch (error) {
      this.isConnecting = false;
      return this.handleConnectionError(error, retryCount);
    }
  }

  /**
   * Handle connection errors with detailed diagnostics
   */
  async handleConnectionError(error, retryCount) {
    const errorType = this.identifyErrorType(error);
    
    console.error(`\nMongoDB Connection Failed (Attempt ${retryCount + 1}/${this.maxRetries + 1})`);
    console.error(`   Error Type: ${errorType.type}`);
    console.error(`   Description: ${errorType.description}`);
    
    // Log the full error in development
    if (config.nodeEnv === 'development') {
      console.error(`   Technical Details: ${error.message}`);
    }

    // Provide solutions based on error type
    console.log(`\nTroubleshooting Steps:`);
    errorType.solutions.forEach((solution, index) => {
      console.log(`   ${index + 1}. ${solution}`);
    });

    // Retry logic with exponential backoff
    if (retryCount < this.maxRetries) {
      const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
      console.log(`\nRetrying in ${delay / 1000} seconds...\n`);
      
      await this.sleep(delay);
      return this.connect(retryCount + 1);
    }

    // Max retries exceeded
    console.error(`\nMax retry attempts (${this.maxRetries}) exceeded.`);
    console.error(`Server will start WITHOUT database connection.`);
    console.error(`API endpoints requiring database will not function.\n`);

    return null;
  }

  /**
   * Identify the type of connection error
   */
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

  /**
   * Setup MongoDB event handlers
   */
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

    // Graceful shutdown handlers
    process.on('SIGINT', this.gracefulShutdown.bind(this, 'SIGINT'));
    process.on('SIGTERM', this.gracefulShutdown.bind(this, 'SIGTERM'));
  }

  /**
   * Graceful shutdown
   */
  async gracefulShutdown(signal) {
    console.log(`\n${signal} received. Closing MongoDB connection...`);
    await this.disconnect();
    process.exit(0);
  }

  /**
   * Mask sensitive connection string information
   */
  maskConnectionString(uri) {
    try {
      return uri.replace(/\/\/([^:]+):([^@]+)@/, '//*****:*****@');
    } catch {
      return 'mongodb://***hidden***';
    }
  }

  /**
   * Sleep utility for retry delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if database is connected
   */
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

