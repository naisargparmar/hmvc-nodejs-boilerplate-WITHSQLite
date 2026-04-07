# Booking API

A RESTful API built with Node.js, Express, and SQLite following the HMVC architectural pattern.

## Features

- HMVC architectural pattern with modular structure
- RESTful API endpoints for user resources
- Complete CRUD operations for models
- Advanced querying with pagination, search, and filtering
- Data validation and error handling
- JWT token authentication
- Security middleware (Helmet, CORS, rate limiting)
- Environment configuration with .env file
- Clean API responses with consistent structure
- Database indexing for optimal performance
- Swagger API documentation

## Project Structure

```
.
├── config/                 # Configuration files
│   └── database.js         # Database connection and initialization
├── modules/                # Main modules
│   ├── user/               # User module
│   │   ├── controllers/    # User controllers
│   │   ├── models/         # User models
│   │   └── routes/         # User routes
│   └── auth/               # Authentication module
│       ├── controllers/    # Auth controllers
│       ├── models/         # Auth models
│       └── routes/         # Auth routes
├── middleware/             # Custom middleware
│   ├── auth.js             # Authentication middleware
│   └── validation.js       # Validation middleware
├── utils/                  # Utility functions
├── test/                   # Test files
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── server.js               # Main server file
├── init.js                 # Database initialization script
└── package.json            # Node.js dependencies
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env` file (refer to `.env.example`)
4. Initialize the database:
   ```bash
   node init.js
   ```
5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### User Endpoints
- `GET /api/users` - Get all users with pagination, search, and filtering
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user and get JWT token

## Database Schema

### Users Table
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `username` (TEXT, UNIQUE, NOT NULL)
- `email` (TEXT, UNIQUE, NOT NULL)
- `password` (TEXT, NOT NULL)
- `first_name` (TEXT)
- `last_name` (TEXT)
- `phone` (TEXT)
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

### Auth Tokens Table
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `user_id` (INTEGER, NOT NULL, FOREIGN KEY)
- `token` (TEXT, UNIQUE, NOT NULL)
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `expires_at` (DATETIME, NOT NULL)
- `is_active` (BOOLEAN, DEFAULT 1)

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- JWT token authentication
- Input validation and sanitization

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

## License

This project is licensed under the MIT License.