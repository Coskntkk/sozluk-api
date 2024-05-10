const router = require('express').Router()
// Db
const { User, Role } = require("../db/models");
// Middlewares
const checkAuthentication = require('../middlewares/checkAuthentication');
const checkReqBody = require('../middlewares/checkReqBody');
// 3rd party
const { Op } = require("sequelize");
// Utils
const AppError = require("../utils/appError");
const { registerEmail, changePassword } = require("../utils/emailFunctions");
const {
    decryptToken,
    isPasswordCorrect,
    generateInitialTokens,
    generateAccessToken,
    createVerificationToken,
    verifyVerificationToken
} = require("../utils/authFunctions");
// Import controllers
// const authController = require('../controllers/authController');

// Set routes
//* /api/v1/auth/
// Register user
router.post(
    "/register",
    checkReqBody(["username", "email", "password"]),
    async (req, res, next) => {
        try {
            const { username, password, email } = req.body;
            // Check if user exists
            const userExists = await User.findOne(
                { where: { [Op.or]: [{ username }, { email }] } }
            );
            if (userExists) throw new AppError("Username or email already exists", 400);
            // Create user
            const user = await User.create({
                username,
                password,
                email,
                roleId: 1,
                is_active: false,
            });
            // Get user
            let result = await User.findByPk(user.id, {
                attributes: {
                    exclude: ["password", "refresh_token", "access_token", "createdAt", "updatedAt"],
                },
            });
            // Create verification token and send email
            const token = await createVerificationToken(user);
            const apiurl = process.env.NODE_ENV === "production" ? process.env.API_URL : process.env.API_URL_DEV;
            await registerEmail({ email, url: `${apiurl}/api/v1/auth/verify/${token}` });
            // Send response
            res.status(200).json({
                success: true,
                message: req.msg.auth.success.register,
                data: result,
            });
        } catch (error) {
            next(error)
        }
    }
);

// Verify user email
router.get(
    "/verify/:token",
    async (req, res, next) => {
        try {
            const { token } = req.params;
            // Verify token
            const decoded_token = await verifyVerificationToken(token);
            // Check if user exists
            const user = await User.findByPk(decoded_token.id);
            if (!user) throw new AppError("Invalid token", 400);
            // Update user
            user.is_active = true;
            user.email_token = null;
            await user.save();
            // Send response
            res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
        } catch (error) {
            next(error)
        }
    }
);

// Login user
router.post(
    "/login",
    checkReqBody(["username", "password"]),
    async (req, res, next) => {
        try {
            const { username, password } = req.body;
            // Find user
            let user = await User.findOne(
                {
                    where: { username },
                    include: [{ model: Role, attributes: ["name"] }],
                }
            );
            if (!user || !user.is_active) throw new AppError("Username is incorrect", 400);
            // Check user password
            let passwordCorrect = await isPasswordCorrect(user, password);
            if (!passwordCorrect) throw new AppError("Password is incorrect", 400);
            // Generate tokens
            const { refresh_token, access_token } = await generateInitialTokens(user);
            res.header("x-access-token", access_token);
            res.header("x-refresh-token", refresh_token);
            // Get user
            let result = await User.findByPk(user.id, {
                attributes: ["id", "username"],
                include: [{ model: Role }],
            });
            // Send response
            res.status(200).json({
                success: true,
                message: req.msg.auth.success.login,
                data: result,
            });
        } catch (error) {
            next(error)
        }
    }
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
                message: req.msg.auth.success.getAccessToken,
                data: access_token,
            });
        } catch (error) {
            next(error)
        }
    }
);

// Check if the user is logged in
router.get(
    "/checkLogin",
    checkAuthentication(),
    async (req, res, next) => {
        try {
            // This route is only accessible if the user is logged in so there is no need to do any checks
            let user = await User.findByPk(req.user.id, { attributes: ["access_token", "refresh_token"] });
            let refresh_token = await decryptToken(user.refresh_token);
            let access_token = await generateAccessToken(refresh_token)
            // Send response
            res.header("x-access-token", access_token);
            res.header("x-refresh-token", refresh_token);
            res.status(200).json({
                success: true,
                message: req.msg.auth.success.checkLogin,
                data: {
                    id: req.user.id,
                    username: req.user.username,
                    email: req.user.email,
                    role: req.user.role.name,
                    image: req.user.image_url
                },
            });
        } catch (error) {
            next(error)
        }
    }
);

// Logout the user
router.get(
    "/logout",
    checkAuthentication(),
    async (req, res, next) => {
        try {
            // Remove tokens from db
            await User.update(
                { refresh_token: null },
                { where: { id: req.user.id } }
            );
            // Remove tokens from header
            res.header("x-refresh-token", "");
            res.header("x-access-token", "");
            // Send response
            res.status(200).json({
                success: true,
                data: null,
            });
        } catch (error) {
            next(error)
        }
    }
);

// Send password reset email
router.post(
    "/password",
    checkReqBody(["email"]),
    async (req, res, next) => {
        try {
            const { email } = req.body;
            // Check if user exists
            const user = await User.findOne({ where: { email } });
            if (!user) throw new AppError("Email not found", 400);
            // Create verification token and send email
            const token = await createVerificationToken(user);
            const clientUrl = process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : process.env.CLIENT_URL_DEV;
            await changePassword({ email, url: `${clientUrl}/reset-password/${token}` });
            // Send response
            res.status(200).json({
                success: true,
                data: null,
            });
        } catch (error) {
            next(error)
        }
    }
);

module.exports = router;