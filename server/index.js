const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: './config.env' });

const { initDatabase } = require('./config/initDb');
const { testConnection } = require('./config/database');
const experienceRoutes = require('./routes/experiences');
const bookingRoutes = require('./routes/bookings');
const promoRoutes = require('./routes/promo');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser clients
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/experiences', experienceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/promo', promoRoutes);
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BookIt API is running',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const startServer = async () => {
  try {
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Could not connect to database');
    }
    
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
};

startServer();
