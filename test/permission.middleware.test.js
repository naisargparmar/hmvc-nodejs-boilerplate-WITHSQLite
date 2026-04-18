const requirePermission = require('../middleware/requirePermission');

describe('requirePermission Middleware', () => {
  it('should call next() when user has the required permission', () => {
    const req = {
      permissions: ['user:create', 'user:read']
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    const next = jest.fn();
    
    const middleware = requirePermission('user:create');
    middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 403 when user does not have the required permission', () => {
    const req = {
      permissions: ['user:read', 'user:update']
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    const next = jest.fn();
    
    const middleware = requirePermission('user:create');
    middleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Forbidden: missing permission"
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 when permissions array is missing', () => {
    const req = {};
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    const next = jest.fn();
    
    const middleware = requirePermission('user:create');
    middleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Forbidden: missing permission"
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 when permissions is not an array', () => {
    const req = {
      permissions: 'user:create'
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    const next = jest.fn();
    
    const middleware = requirePermission('user:create');
    middleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Forbidden: missing permission"
    });
    expect(next).not.toHaveBeenCalled();
  });
});