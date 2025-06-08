const router = require("express").Router();
// Middlewares
const checkAuthentication = require("../middlewares/checkAuthentication");
const checkReqBody = require("../middlewares/checkReqBody");
// Utils
const AppError = require("../utils/appError");
const { registerEmail, changePassword } = require("../utils/emailFunctions");
const {
  isPasswordCorrect,
  generateInitialTokens,
  generateAccessToken,
  createVerificationToken,
  verifyVerificationToken,
} = require("../utils/authFunctions");
const {
  createUser,
  getUserByParams,
  updateUserByParam,
  getUserByParamsAuth,
} = require("../controllers/userController");
// Import controllers
const { createOrWhere } = require("../controllers/scopes");

// Set routes
//* /api/v1/auth/
// Register user
router.post(
  "/register",
  checkReqBody(["username", "email", "password"]),
  async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      // Check if user exists
      let opt = [{ username }, { email }];
      let where = createOrWhere(opt);
      const userExists = await getUserByParams(where);
      if (userExists)
        throw new AppError("Username or email already exists", 400);
      // Create user
      let user = await createUser({
        username,
        password,
        email,
      });
      // Create verification token and send email
      const { verification_token, key } = await createVerificationToken(user);
      const apiurl =
        process.env.NODE_ENV === "production"
          ? process.env.API_URL
          : process.env.API_URL_DEV;
      await registerEmail({
        email,
        url: `${apiurl}/api/v1/auth/verify/${verification_token}`,
      });
      user.email_verify_token = key;
      await user.save();
      // Send response
      res.status(200).json({
        success: true,
        message:
          "Successfully registered. Please check your mailbox to activate your account.",
      });
    } catch (error) {
      next(error);
    }
  },
);

// Verify user email
router.get(
  "/verify/:token",
  async (req, res, next) => {
    try {
      const { token } = req.params;
      if (!token) throw new AppError("No token", 400);
      // Verify token
      const decoded_token = await verifyVerificationToken(token);
      const { id, key } = decoded_token;
      // Check if user exists
      let user = await getUserByParamsAuth({ id });
      if (!user || user.email_verify_token !== key)
        throw new AppError("Invalid token", 400);
      // Update user
      user.is_active = true;
      user.email_verify_token = null;
      await user.save();
      // Send response
      res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
    } catch (error) {
      next(error);
    }
  });

// Login user
router.post(
  "/login",
  checkReqBody(["username", "password"]),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      // Find user
      let user = await getUserByParamsAuth({ username });
      if (!user) throw new AppError("User not found.", 400);
      if (!user.is_active) throw new AppError("User is not active.", 400);
      // Check user password
      let passwordCorrect = await isPasswordCorrect(user, password);
      if (!passwordCorrect) throw new AppError("Password is incorrect", 400);
      // Generate tokens
      const { refresh_token, access_token } = await generateInitialTokens(user);
      res.header("x-access-token", access_token);
      res.header("x-refresh-token", refresh_token);
      // Send response
      res.status(200).json({
        success: true,
        message: "Login successful.",
        access_token: access_token,
        refresh_token: refresh_token
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get access token
router.post(
  "/accessToken",
  checkReqBody(["refresh_token"]),
  async (req, res, next) => {
    try {
      const { refresh_token } = req.body;
      // Generate access token
      const access_token = await generateAccessToken(refresh_token);
      // Send response
      res.header("x-access-token", access_token);
      res.status(200).json({
        success: true,
        data: access_token,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Logout the user
router.get(
  "/logout",
  checkAuthentication(),
  async (req, res, next) => {
    try {
      await updateUserByParam({ id: req.user.id }, { refresh_token: null });
      // Remove tokens from header
      res.header("x-refresh-token", "");
      res.header("x-access-token", "");
      // Send response
      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (error) {
      next(error);
    }
  });

// Send password reset email
router.post(
  "/password",
  checkReqBody(["email"]),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      // Check if user exists
      let user = await getUserByParams({ email });
      if (!user) throw new AppError("Email not found", 400);
      // Create verification token and send email
      const { verification_token, key } = await createVerificationToken(user);
      const clientUrl =
        process.env.NODE_ENV === "production"
          ? process.env.CLIENT_URL
          : process.env.CLIENT_URL_DEV;
      await changePassword({
        email,
        url: `${clientUrl}/reset-password/${verification_token}`,
      });
      user.password_verify_token = key;
      await user.save();
      // Send response
      res.status(200).json({
        success: true,
        message: "Password reset mail sent. Please check your mailbox..",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
