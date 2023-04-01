const router = require('express').Router();
const { Role } = require('../db/models');

// Middlewares
const checkAuthentication = require('../middlewares/checkAuthentication');
const checkAuthorization = require('../middlewares/checkAuthorization');
const checkReqBody = require('../middlewares/checkReqBody');
const checkReqParams = require('../middlewares/checkReqParams');
// Import controllers
const roleController = require('../controllers/roleController');

// Set routes
//* /api/v1/roles/
// Get all roles
router.get(
    "/",
    checkAuthentication(),
    checkAuthorization("role_read", Role),
    roleController.getAllRoles
);

// Create new role
router.post(
    "/",
    checkAuthentication(),
    checkAuthorization("role_create", Role),
    checkReqBody(["name"]),
    roleController.createRole
);

// Get role by id
router.get(
    "/:id",
    checkAuthentication(),
    checkAuthorization("role_read", Role),
    checkReqParams(["id"]),
    roleController.getRoleById
);

// Update role by id
router.put(
    "/:id",
    checkAuthentication(),
    checkAuthorization("role_update", Role),
    checkReqParams(["id"]),
    checkReqBody(["name"]),
    roleController.updateRoleById
);

// Delete role by id
router.delete(
    "/:id",
    checkAuthentication(),
    checkAuthorization("role_delete", Role),
    checkReqParams(["id"]),
    roleController.deleteRoleById
);

// Export router
module.exports = router;