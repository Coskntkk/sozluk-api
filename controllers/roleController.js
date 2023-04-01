// Db
const { Role } = require("../db/models");
const AppError = require("../utils/appError");
// Utils
const catchAsync = require("../utils/catchAsync");

// Get all roles
// GET /api/v1/roles/
exports.getAllRoles = catchAsync(async (req, res) => {
    // Find roles
    const roles = await Role.findAll({order: [['id', 'ASC']]});
    // Send response
    res.status(200).json({
        success: true,
        message: "Roles fetched successfully",
        data: roles,
    });
});

// Create Role
// POST /api/v1/roles/
exports.createRole = catchAsync(async (req, res) => {
    const { name } = req.body;
    // Create role
    const role = await Role.create({ name: name });
    // Send response
    res.status(200).json({
        success: true,
        message: "Role created successfully",
        data: role,
    });
});

// Get role by id
// GET /api/v1/roles/:id
exports.getRoleById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // Find role
    const role = await Role.findByPk(id);
    if (!role) {
        return next(new AppError("Entry not found", 404));
    }
    // Send response
    res.status(200).json({
        success: true,
        message: "Role fetched successfully",
        data: role,
    });
});

// Update role by id
// PUT /api/v1/roles/:id
exports.updateRoleById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;
    // Find role
    const role = await Role.findByPk(id);
    if (!role) {
        return next(new AppError("Role not found", 404));
    }
    // Update role
    role.name = name;
    await role.save();
    // Send response
    res.status(200).json({
        success: true,
        message: "Role updated successfully",
        data: role,
    });
});

// Delete role by id
// DELETE /api/v1/roles/:id
exports.deleteRoleById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // Find role
    const role = await Role.findByPk(id);
    if (!role) {
        return next(new AppError("Role not found", 404));
    }
    // Delete role
    await role.destroy();
    // Send response
    res.status(200).json({
        success: true,
        message: "Role deleted successfully",
        data: role,
    });
});