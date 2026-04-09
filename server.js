const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

// Load environment variables
dotenv.config();

// Import routes
const userRoutes = require('./modules/user/routes/user.routes');
const authRoutes = require('./modules/auth/routes/auth.routes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Booking API is running',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Swagger setup
const { specs } = require('./swagger.js');
// Serve static files for Swagger UI
const swaggerUi = require('swagger-ui-express');
const swaggerUiDist = require('swagger-ui-dist');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 404 handler
app.use((req, res) => {
// app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API Base URL: ${process.env.BASE_URL}/api`);
  console.log(`📄 Swagger Docs: ${process.env.BASE_URL}/api-docs`);
});

module.exports = app;
