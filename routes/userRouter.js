const router = require('express').Router();
const { User, Entry } = require('../db/models');

// Middlewares
const checkAuthentication = require('../middlewares/checkAuthentication');
const checkAuthorization = require('../middlewares/checkAuthorization');
const checkReqBody = require('../middlewares/checkReqBody');
const checkReqParams = require('../middlewares/checkReqParams');
const checkPagination = require('../middlewares/checkPagination');
// Import controllers
const userController = require('../controllers/userController');

// Set routes
//* /api/v1/users/
// Get all users
router.get(
    "/",
    checkPagination(),
    checkAuthorization("user_read", User),
    userController.getAllUsers
);

// Get user by id
router.get(
    "/:id",
    checkReqParams(["id"]),
    checkAuthorization("user_read", User),
    userController.getUserById
);

// Update user by id
router.put(
    "/:id",
    checkAuthentication(),
    checkAuthorization("user_update", User),
    checkReqParams(["id"]),
    checkReqBody(["username", "email", "image_url"]),
    userController.updateUserById
);

// Update user password by id
router.put(
    "/:id/password",
    checkAuthentication(),
    checkAuthorization("user_update", User),
    checkReqParams(["id"]),
    checkReqBody(["password"]),
    userController.updateUserPasswordById
);

// Delete user by id
router.delete(
    "/:id",
    checkAuthentication(),
    checkAuthorization("user_delete", User),
    checkReqParams(["id"]),
    userController.deleteUserById
);

// Get entries by user id
router.get(
    "/:id/entries",
    checkAuthorization("entry_read", Entry),
    checkReqParams(["id"]),
    checkPagination(),
    userController.getEntriesByUserId
);

// Export router
module.exports = router;