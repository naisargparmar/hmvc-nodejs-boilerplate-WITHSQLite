const express = require('express');
const router = express.Router();
const RolePermission = require('../models/rolePermission.model');
const Joi = require('joi');
const authMiddleware = require('../../../middleware/auth');
const attachPermissions = require('../../../middleware/attachPermissions');
const requirePermission = require('../../../middleware/requirePermission');

// Validation schema
const rolePermissionSchema = Joi.object({
  role_id: Joi.number().integer().required(),
  permission_id: Joi.number().integer().required()
});

/**
 * @swagger
 * /api/role-permissions:
 *   post:
 *     summary: Assign a permission to a role
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_id
 *               - permission_id
 *             properties:
 *               role_id:
 *                 type: integer
 *                 example: 1
 *               permission_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Permission assigned to role successfully
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
 *                   example: "Permission assigned to role successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     role_id:
 *                       type: integer
 *                       example: 1
 *                     permission_id:
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
 *                   example: "role_id is required"
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

// Assign permission to role
router.post('/', authMiddleware, attachPermissions, requirePermission('role_permission:create'), (req, res) => {
  const { error, value } = rolePermissionSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: error.details[0].message
    });
  }
  
  RolePermission.assignPermissionToRole(value.role_id, value.permission_id, (err, rolePermission) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: err.message
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Permission assigned to role successfully',
      data: rolePermission
    });
  });
});

/**
 * @swagger
 * /api/role-permissions/{roleId}:
 *   get:
 *     summary: Get all permissions assigned to a role
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The role ID
 *     responses:
 *       200:
 *         description: Role permissions retrieved successfully
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
 *                       permission_id:
 *                         type: integer
 *                         example: 2
 *                       name:
 *                         type: string
 *                         example: "read_users"
 *                       description:
 *                         type: string
 *                         example: "Allow reading user data"
 *       404:
 *         description: Role not found
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
 *                   example: "Role not found"
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

// Get role permissions
router.get('/:roleId', authMiddleware, attachPermissions, requirePermission('role_permission:read'), (req, res) => {
  const roleId = req.params.roleId;
  
  RolePermission.getPermissionsByRole(roleId, (err, rolePermissions) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: err.message
      });
    }
    
    res.json({
      success: true,
      data: rolePermissions
    });
  });
});

module.exports = router;