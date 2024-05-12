const router = require('express').Router();
const { getRoles, createRole, getRoleByParams, deleteRoleByParams, updateRoleByParams } = require('../controllers/roleController');

// Middlewares
const checkAuthentication = require('../middlewares/checkAuthentication');
const checkAuthorization = require('../middlewares/checkAuthorization');
const checkReqBody = require('../middlewares/checkReqBody');
const checkReqParams = require('../middlewares/checkReqParams');

// Set routes
//* /api/v1/roles/
// Get all roles
router.get(
    "/",
    checkAuthentication(),
    checkAuthorization("role_read"),
    async (req, res, next) => {
        try {
            // Create role
            const roles = await getRoles()
            // Send response
            res.status(200).json({
                success: true,
                data: roles,
            });
        } catch (error) {
            next(error)
        }
    }
);

// Create new role
router.post(
    "/",
    checkAuthentication(),
    checkAuthorization("role_create"),
    checkReqBody(["name"]),
    async (req, res, next) => {
        try {
            // Create role
            const role = await createRole(req.body)
            // Send response
            res.status(200).json({
                success: true,
                message: "Role created.",
                data: role,
            });
        } catch (error) {
            next(error)
        }
    }
);

// Get role by id
router.get(
    "/:id",
    checkAuthentication(),
    checkAuthorization("role_read"),
    checkReqParams(["id"]),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            // Find role
            const role = await getRoleByParams({ id: id })
            // Send response
            res.status(200).json({
                success: true,
                data: role,
            });
        } catch (error) {
            next(error)
        }
    }
);

// Update role by id
router.put(
    "/:id",
    checkAuthentication(),
    checkAuthorization("role_update"),
    checkReqParams(["id"]),
    checkReqBody(["name"]),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            // Find role
            const role = await updateRoleByParams({ id: id }, req.body)
            // Send response
            res.status(200).json({
                success: true,
                message: "Role updated.",
                data: role,
            });
        } catch (error) {
            next(error)
        }
    }
);

// Delete role by id
router.delete(
    "/:id",
    checkAuthentication(),
    checkAuthorization("role_delete"),
    checkReqParams(["id"]),
    async (req, res, next) => {
        try {
            const { id } = req.params
            // Delete role
            await deleteRoleByParams({ id: id })
            // Send response
            res.status(200).json({
                success: true,
                message: "Role deleted.",
                data: id
            });
        } catch (error) {
            next(error)
        }
    }
);

// Export router
module.exports = router;