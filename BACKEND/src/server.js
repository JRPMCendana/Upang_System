const app = require('./app');
const config = require('./config/config');
const database = require('./config/database');

const PORT = config.port;
const NODE_ENV = config.nodeEnv;

async function startServer() {
  try {
    await database.connect();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
      console.log('Press CTRL+C to stop the server');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

startServer();
