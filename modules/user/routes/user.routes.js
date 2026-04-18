const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../../middleware/auth');
const attachPermissions = require('../../../middleware/attachPermissions');
const requirePermission = require('../../../middleware/requirePermission');
const loadUserResource = require('../../../middleware/loadUserResource');
// const userScopeValidation = require('../../../middleware/userScopeValidation');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier of the user
 *           example: 1
 *         username:
 *           type: string
 *           description: The user's username
 *           example: "naisarg"
 *         email:
 *           type: string
 *           description: The user's email
 *           example: "user@example.com"
 *         first_name:
 *           type: string
 *           description: The user's first name
 *           example: "Naisarg"
 *         last_name:
 *           type: string
 *           description: The user's last name
 *           example: "Parmar"
 *         phone:
 *           type: string
 *           description: The user's phone number
 *           example: "+1234567890"
 *         created_at:
 *           type: string
 *           description: The date the user was created
 *           example: "2023-01-01T00:00:00.000Z"
 *         updated_at:
 *           type: string
 *           description: The date the user was last updated
 *           example: "2023-01-01T00:00:00.000Z"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Validation schema
const userSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().max(50),
  last_name: Joi.string().max(50),
  phone: Joi.string().max(20)
});

const updateUserSchema = Joi.object({
  first_name: Joi.string().max(50),
  last_name: Joi.string().max(50),
  phone: Joi.string().max(20)
});


/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination, search, and filtering
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           default: ''
 *         description: Search term for filtering users
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: id
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           default: ASC
 *         description: Sort order (ASC or DESC)
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     pages:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Access token required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Access token required"
 *       403:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired token"
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Database error"
 *                 message:
 *                   type: string
 *                   example: "Error message"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */

// Get all users with pagination, search, and filtering
 router.get('/', authMiddleware, attachPermissions, requirePermission('user:read'), (req, res) => {
   const { page = 1, limit = 10, search = '', sort = 'id', order = 'ASC' } = req.query;
   
   // If we have filters from userScopeValidation middleware, use them
   const filters = req.filters || {};
   
   User.findAll({ page, limit, search, sort, order, filters }, (err, result) => {
     if (err) {
       return res.status(500).json({
         success: false,
         error: 'Database error',
         message: err.message
       });
     }
     
     res.json({
       success: true,
       data: result.users,
       pagination: result.pagination
     });
   });
 });

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Access token required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Access token required"
 *       403:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired token"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Database error"
 *                 message:
 *                   type: string
 *                   example: "Error message"
 */

// Get user by ID
router.get('/:id', authMiddleware, attachPermissions, requirePermission('user:read'), (req, res) => {
  const userId = req.params.id;
  
  User.findById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: err.message
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  });
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "naisarg"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               first_name:
 *                 type: string
 *                 example: "Naisarg"
 *               last_name:
 *                 type: string
 *                 example: "Parmar"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Validation error"
 *                 message:
 *                   type: string
 *                   example: "username is required"
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "User already exists"
 *                 message:
 *                   type: string
 *                   example: "A user with this email or username already exists"
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Database error"
 *                 message:
 *                   type: string
 *                   example: "Error message"
 */

// Create new user
router.post('/', authMiddleware, attachPermissions, requirePermission('user:create'), (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: error.details[0].message
    });
  }
  
  User.create(value, (err, user) => {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({
          success: false,
          error: 'User already exists',
          message: 'A user with this email or username already exists'
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: err.message
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "Naisarg"
 *               last_name:
 *                 type: string
 *                 example: "Parmar"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Validation error"
 *                 message:
 *                   type: string
 *                   example: "username is required"
 *       401:
 *         description: Access token required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Access token required"
 *       403:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired token"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "User already exists"
 *                 message:
 *                   type: string
 *                   example: "A user with this email or username already exists"
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Database error"
 *                 message:
 *                   type: string
 *                   example: "Error message"
 */

// Update user
// router.put('/:id', authMiddleware, attachPermissions, loadUserResource, requirePermission('user:update'), (req, res) => {
router.put('/:id', authMiddleware, attachPermissions, requirePermission('user:update'), (req, res) => {
  const userId = req.params.id;
  
  const { error, value } = updateUserSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: error.details[0].message
    });
  }
  
  // Check if user exists
  User.findById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: err.message
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    User.update(userId, value, (err, updatedUser) => {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({
            success: false,
            error: 'User already exists',
            message: 'A user with this email or username already exists'
          });
        }
        
        return res.status(500).json({
          success: false,
          error: 'Database error',
          message: err.message
        });
      }
      
      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    });
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deleted:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Access token required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Access token required"
 *       403:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired token"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Database error"
 *                 message:
 *                   type: string
 *                   example: "Error message"
 */

// Delete user
// router.delete('/:id', authMiddleware, attachPermissions, loadUserResource, requirePermission('user:delete'), (req, res) => {
router.delete('/:id', authMiddleware, attachPermissions, requirePermission('user:delete'), (req, res) => {
  const userId = req.params.id;
  
  User.delete(userId, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: err.message
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      data: result
    });
  });
});

module.exports = router;