const request = require('supertest');
const app = require('../server');
const db = require('../config/database');

describe('Booking API', () => {
  beforeAll((done) => {
    // Initialize database
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users_test (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      done();
    });
  });

  afterAll((done) => {
    // Close database connection
    db.close(() => {
      done();
    });
  });

  it('should return health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'OK');
  });

  it('should register a new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
      phone: '1234567890'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);
    
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('username', userData.username);
    expect(response.body.user).toHaveProperty('email', userData.email);
  });

  it('should login user and return token', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);
    
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });
});