const loadUserResource = require('../middleware/loadUserResource');
const User = require('../modules/user/models/user.model');
const UserRole = require('../modules/rbac/models/userRole.model');

// Mock request and response objects
const mockReq = {
  user: { id: 1 }
};

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
};

const next = jest.fn();

describe('loadUserResource Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should load user details and roles when user exists', (done) => {
    // Mock User.findById to return a user
    User.findById = jest.fn((id, callback) => {
      callback(null, {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      });
    });

    // Mock UserRole.getUserRoles to return roles
    UserRole.getUserRoles = jest.fn((userId, callback) => {
      callback(null, [
        { role_id: 1, name: 'admin', description: 'Administrator' }
      ]);
    });

    // Call the middleware
    loadUserResource(mockReq, mockRes, next);

    // Wait for the async operation to complete
    setTimeout(() => {
      expect(mockReq.userDetails).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      });
      expect(mockReq.userRoles).toEqual([
        { role_id: 1, name: 'admin', description: 'Administrator' }
      ]);
      expect(mockReq.userRoleName).toBe('admin');
      expect(next).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should handle error when fetching user details', (done) => {
    // Mock User.findById to return an error
    User.findById = jest.fn((id, callback) => {
      callback(new Error('Database error'), null);
    });

    loadUserResource(mockReq, mockRes, next);

    setTimeout(() => {
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should handle error when fetching user roles', (done) => {
    // Mock User.findById to return a user
    User.findById = jest.fn((id, callback) => {
      callback(null, { id: 1, username: 'testuser' });
    });

    // Mock UserRole.getUserRoles to return an error
    UserRole.getUserRoles = jest.fn((userId, callback) => {
      callback(new Error('Database error'), null);
    });

    loadUserResource(mockReq, mockRes, next);

    setTimeout(() => {
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalled();
      done();
    }, 10);
  });
});