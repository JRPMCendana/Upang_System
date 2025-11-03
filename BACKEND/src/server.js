const app = require('./app');
const config = require('./config/config');
const database = require('./config/database');

const PORT = config.port;
const NODE_ENV = config.nodeEnv;

async function startServer() {
  try {
    console.log('Starting Upang Learning System Server...');

    // Attempt to connect to MongoDB with retry logic
    const dbConnection = await database.connect();

    if (!dbConnection) {
      console.log('WARNING: Server starting in LIMITED MODE');
      console.log('   Database not connected');
      console.log('   API endpoints requiring database will fail');
      console.log('   Health check endpoint will still work');
    }

    // Start the HTTP server regardless of database connection
    const server = app.listen(PORT, () => {
      console.log('Server Started Successfully!');
      console.log(`   URL: http://localhost:${PORT}`);
      console.log(`   Environment: ${NODE_ENV}`);
      console.log('Press CTRL+C to stop the server\n');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\nPort ${PORT} is already in use!`);
        console.log('Try one of the following:');
        console.log('   1. Stop the process using this port');
        console.log('   2. Change PORT in your .env file');
        console.log('   3. Kill the process: netstat -ano | findstr :' + PORT);
      } else {
        console.error('\nServer error:', error.message);
      }
      process.exit(1);
    });

    // If database connects later, log it
    if (!database.isConnected()) {
      console.log('Will continue attempting to connect to database in background...\n');
    }

  } catch (error) {
    console.error('\nCritical Error - Failed to start server:', error.message);
    
    if (NODE_ENV === 'development') {
      console.error('\nStack Trace:');
      console.error(error.stack);
    }
    
    console.log('\nTroubleshooting:');
    console.log('   1. Check if all required environment variables are set');
    console.log('   2. Verify .env file exists and is properly formatted');
    console.log('   3. Check if the port is available');
    console.log('   4. Review the error message above\n');
    
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  // Check if it's a GridFS or Mongo file-not-found deletion error - don't crash for these
  const errorMessage = String(err && (err.message || err) || '');
  const isFileNotFoundError = errorMessage.includes('File not found');

  if (isFileNotFoundError) {
    return; // Silently ignore GridFS file-not-found deletes
  }

  console.error('\nUnhandled Promise Rejection:', err && err.message ? err.message : String(err));
  if (config.nodeEnv === 'development') {
    console.error('Stack Trace:');
    console.error(err && err.stack ? err.stack : '');
  }

  // Don't exit immediately - give time for cleanup
  setTimeout(() => {
    console.log('\nShutting down due to unhandled rejection...');
    process.exit(1);
  }, 1000);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('\nUncaught Exception:', err.message);
  
  if (config.nodeEnv === 'development') {
    console.error('Stack Trace:');
    console.error(err.stack);
  }
  
  console.log('\nShutting down due to uncaught exception...');
  process.exit(1);
});

startServer();
