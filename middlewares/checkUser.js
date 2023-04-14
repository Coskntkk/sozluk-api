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
        try {
            // Get token from cookie
            const token = req.headers["x-access-token"];
            if (token) {
                // Verify token
                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                if (!decoded) {
                    next();
                }
                // Get user
                let user = await User.findByPk(decoded.id);
                if (!user || !user.is_active) {
                    next();
                }
                // Check if token is valid
                let isAccessTokenValid = await checkIsAccessTokenValid(token, user);
                if (!isAccessTokenValid) {
                    next();
                }
                // Check if token is expired
                if (decoded.expire < Date.now()) {
                    next();
                }
                // Set user to request
                let role = await Role.findByPk(user.role_id);
                req.user = { ...user.dataValues, role: role.dataValues };
            }
            // Continue
            next();
        } catch (err) {
            next();
        }
    });
};

// Export
module.exports = checkAuthentication;