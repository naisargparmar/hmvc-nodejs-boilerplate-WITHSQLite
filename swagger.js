const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Booking API',
      version: '1.0.0',
      description: 'A RESTful API implementation for booking management with Node.js, Express.js, and SQLite',
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./modules/*/routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
