const router = require('express').Router();

// Middlewares
const checkAuthentication = require('../middlewares/checkAuthentication');
const checkReqBody = require('../middlewares/checkReqBody');

// Import controllers
const authController = require('../controllers/authController');

// Set routes
//* /api/v1/auth/
// Register user
router.post("/register", checkReqBody(["username", "email", "password"]), authController.register);

// Verify user email
router.get("/verify/:token", authController.verifyEmail);

// Login user
router.post("/login", checkReqBody(["username", "password"]), authController.login);

// Get access token
router.post("/accessToken", checkReqBody(["refresh_token"]), authController.getAccessToken);

// Check if the user is logged in
router.get("/checkLogin", checkAuthentication(), authController.checkLogin);

// Logout the user
router.get("/logout", checkAuthentication(), authController.logout);

// Send password reset email
router.post("/password", checkReqBody(["email"]), authController.sendPasswordResetEmail);

// Export router
module.exports = router;