const express = require('express');
const router = express.Router();
const Role = require('../models/role.model');
const Joi = require('joi');
const authMiddleware = require('../../../middleware/auth');
const attachPermissions = require('../../../middleware/attachPermissions');
const requirePermission = require('../../../middleware/requirePermission');

// Validation schema
const roleSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(255)
});

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "admin"
 *               description:
 *                 type: string
 *                 example: "Administrator role"
 *     responses:
 *       201:
 *         description: Role created successfully
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
 *                   example: "Role created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "admin"
 *                     description:
 *                       type: string
 *                       example: "Administrator role"
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
 *                   example: "name is required"
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

// Create new role
router.post('/', authMiddleware, attachPermissions, requirePermission('role:create'), (req, res) => {
  const { error, value } = roleSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: error.details[0].message
    });
  }
  
  Role.createRole(value.name, value.description, (err, role) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: err.message
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  });
});

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
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
 *                       name:
 *                         type: string
 *                         example: "admin"
 *                       description:
 *                         type: string
 *                         example: "Administrator role"
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

// Get all roles
router.get('/', authMiddleware, attachPermissions, requirePermission('role:read'), (req, res) => {
  Role.getAllRoles((err, roles) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: err.message
      });
    }
    
    res.json({
      success: true,
      data: roles
    });
  });
});

module.exports = router;