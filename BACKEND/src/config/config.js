require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV,
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  },
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      // Removed deprecated options
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN 
  },
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ,
    secure: process.env.SMTP_SECURE,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    },
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    frontendUrl: process.env.FRONTEND_URL 
  }
};

