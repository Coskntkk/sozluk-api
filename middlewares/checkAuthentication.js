// Db
const { User, Role } = require("../db/models");
// 3rd party
const jwt = require("jsonwebtoken");
// Utils
const AppError = require("../utils/appError");
const { checkIsAccessTokenValid, generateAccessToken } = require("../utils/authFunctions");
const catchAsync = require("../utils/catchAsync");

// Checks if the client is authenticated
const checkAuthentication = () => {
    return catchAsync(async (req, res, next) => {
        // Get token from cookie
        const token = req.headers["x-access-token"];
        if (!token) {
            return next(new AppError("Token not found.", 401));
        }
        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded) {
            return next(new AppError("Token is not valid.", 401));
        }
        // Get user
        let user = await User.findByPk(decoded.id);
        if (!user || !user.is_active) {
            return next(new AppError("User not found or user is not active.", 401));
        }
        // Check if token is valid
        let isAccessTokenValid = await checkIsAccessTokenValid(token, user);
        if (!isAccessTokenValid) {
            return next(new AppError("Token is not valid.", 401));
        }
        // Check if token is expired
        if (decoded.expire < Date.now()) {
            // Generate new token
            const access_token = await generateAccessToken(req.headers["x-refresh-token"]);
            res.header("x-access-token", access_token);
        }
        // Set user to request
        let role = await Role.findByPk(user.role_id);
        req.user = { ...user.dataValues, role: role.dataValues };
        // Continue
        next();
    });
};

// Export
module.exports = checkAuthentication;