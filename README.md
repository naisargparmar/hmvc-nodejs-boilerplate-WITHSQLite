# Booking API

A RESTful API built with Node.js, Express, and SQLite following the HMVC architectural pattern.

## Features

- HMVC architectural pattern with modular structure
- RESTful API endpoints for user and authentication resources
- Complete CRUD operations for models
- Advanced querying with pagination, search, and filtering
- Data validation and error handling
- JWT token authentication
- Security middleware (Helmet, CORS, rate limiting)
- Environment configuration with .env file
- Clean API responses with consistent structure
- Database indexing for optimal performance
- Swagger API documentation
- RBAC (Role-Based Access Control) support
- Input sanitization and validation
- Database migration support

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
│   ├── auth/               # Authentication module
│   │   ├── controllers/    # Auth controllers
│   │   ├── models/         # Auth models
│   │   └── routes/         # Auth routes
│   └── rbac/               # Role-Based Access Control module
│       ├── controllers/    # RBAC controllers
│       ├── models/         # RBAC models
│       └── routes/         # RBAC routes
├── middleware/             # Custom middleware
│   ├── auth.js             # Authentication middleware
│   ├── attachPermissions.js # Middleware to attach user permissions
│   └── requirePermission.js # Middleware to require specific permissions
├── test/                   # Test files
├── database/               # Database directory
│   ├── schema/             # Database schema files
│   │   ├── users.sql       # Users table schema
│   │   ├── auth_tokens.sql # Auth tokens table schema
│   │   └── rbac_schema.sql # RBAC schema
│   ├── init.js             # Database initialization script
│   └── sqlite.db          # SQLite database file
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── server.js               # Main server file
├── init.js                 # Database initialization script
└── package.json            # Node.js dependencies

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   nvm use 24.14.1
   npm install
   ```
3. Set up environment variables in `.env` file (refer to `.env.example`)
4. Initialize the database:
   ```bash
   npm run db:init
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
- `POST /api/auth/logout` - Logout user and invalidate token
- `POST /api/auth/refresh` - Refresh JWT token

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
- `FOREIGN KEY` (user_id) REFERENCES users (id) ON DELETE CASCADE

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- JWT token authentication
- Input validation and sanitization
- Database security practices
- RBAC (Role-Based Access Control) implementation
- Environment variable security

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Database Initialization
```bash
npm run db:init
```

### Building for Production
```bash
npm run build
```

### Development Server
```bash
npm run dev
```

## License

This project is licensed under the MIT License.