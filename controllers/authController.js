// Db
const { User, Role } = require("../db/models");
// 3rd party
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
// Utils
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { registerEmail, changePassword } = require("../utils/emailFunctions");
const {
    decryptToken,
    isPasswordCorrect,
    generateInitialTokens,
    generateAccessToken,
    createVerificationToken,
    verifyVerificationToken
} = require("../utils/authFunctions");

// Register User
// POST /api/v1/auth/register
exports.register = catchAsync(async (req, res, next) => {
    const { username, password, email } = req.body;
    // Check if user exists
    const userExists = await User.findOne(
        { where: { [Op.or]: [{ username }, { email }] } }
    );
    if (userExists) {
        return next(new AppError("Username or email already exists", 400));
    }
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
});

// Login User
// POST /api/v1/auth/login
exports.login = catchAsync(async (req, res, next) => {
    const { username, password } = req.body;
    // Find user
    let user = await User.findOne(
        {
            where: { username },
            include: [{ model: Role, attributes: ["name"] }],
        }
    );
    if (!user || !user.is_active) {
        return next(new AppError("Username is incorrect", 400));
    }
    // Check user password
    let passwordCorrect = await isPasswordCorrect(user, password);
    if (!passwordCorrect) {
        return next(new AppError("Password is incorrect", 400));
    }
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
});

// Get access token
// POST /api/v1/auth/accessToken
exports.getAccessToken = catchAsync(async (req, res) => {
    const { refresh_token } = req.body;
    // Generate access token
    const { access_token, userId } = await generateAccessToken(refresh_token);
    // Save access token to db
    await User.update({ access_token }, { where: { id: userId } });
    // Send response
    res.header("x-access-token", access_token);
    res.status(200).json({
        success: true,
        message: req.msg.auth.success.getAccessToken,
        data: access_token,
    });
});

// Check if the user is logged in
// GET /api/v1/auth/checkLogin
exports.checkLogin = catchAsync(async (req, res) => {
    // This route is only accessible if the user is logged in so there is no need to do any checks
    let user = await User.findByPk(req.user.id, { attributes: ["access_token", "refresh_token"] });
    let access_token = await decryptToken(user.access_token);
    let refresh_token = await decryptToken(user.refresh_token);
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
        },
    });
});

// Logout the user
// GET /api/v1/auth/logout
exports.logout = catchAsync(async (req, res) => {
    // Remove tokens from db
    await User.update(
        {
            refresh_token: null,
            access_token: null,
        },
        {
            where: { id: req.user.id }
        }
    );
    // Remove tokens from header
    res.header("x-refresh-token", "");
    res.header("x-access-token", "");
    // Send response
    res.status(200).json({
        success: true,
        message: req.msg.auth.success.logout,
        data: null,
    });
});

// Verify user email
// GET /api/v1/auth/verify/:token
exports.verifyEmail = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    // Verify token
    const decoded_token = await verifyVerificationToken(token);
    // Check if user exists
    const user = await User.findByPk(decoded_token.id);
    if (!user) {
        return next(new AppError("Invalid token", 400));
    }
    // Update user
    user.is_active = true;
    user.email_token = null;
    await user.save();
    // Send response
    res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
});

// Send reset password email
// POST /api/v1/auth/password
exports.sendPasswordResetEmail = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
        return next(new AppError("Email not found", 400));
    }
    // Create verification token and send email
    const token = await createVerificationToken(user);
    const clientUrl = process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : process.env.CLIENT_URL_DEV;
    await changePassword({ email, url: `${clientUrl}/reset-password/${token}` });
    // Send response
    res.status(200).json({
        success: true,
        message: req.msg.auth.success.sendPasswordResetEmail,
        data: null,
    });
});
