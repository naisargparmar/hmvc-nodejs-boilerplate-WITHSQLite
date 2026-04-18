const express = require('express');
const router = express.Router();
const UserRole = require('../models/userRole.model');
const Joi = require('joi');
const authMiddleware = require('../../../middleware/auth');
const attachPermissions = require('../../../middleware/attachPermissions');
const requirePermission = require('../../../middleware/requirePermission');

// Validation schema
const userRoleSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  role_id: Joi.number().integer().required()
});

/**
 * @swagger
 * /api/user-roles:
 *   post:
 *     summary: Assign a role to a user
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - role_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               role_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Role assigned to user successfully
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
 *                   example: "Role assigned to user successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     role_id:
 *                       type: integer
 *                       example: 2
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
 *                   example: "user_id is required"
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

// Assign role to user
router.post('/', authMiddleware, attachPermissions, requirePermission('user_role:create'), (req, res) => {
  const { error, value } = userRoleSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: error.details[0].message
    });
  }
  
  UserRole.assignRoleToUser(value.user_id, value.role_id, (err, userRole) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: err.message
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Role assigned to user successfully',
      data: userRole
    });
  });
});

/**
 * @swagger
 * /api/user-roles/{userId}:
 *   get:
 *     summary: Get all roles assigned to a user
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User roles retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       role_id:
 *                         type: integer
 *                         example: 2
 *                       name:
 *                         type: string
 *                         example: "admin"
 *                       description:
 *                         type: string
 *                         example: "Administrator role"
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

// Get user roles
router.get('/:userId', authMiddleware, attachPermissions, requirePermission('user_role:read'), (req, res) => {
  const userId = req.params.userId;
  
  UserRole.getUserRoles(userId, (err, userRoles) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: err.message
      });
    }
    
    res.json({
      success: true,
      data: userRoles
    });
  });
});

module.exports = router;