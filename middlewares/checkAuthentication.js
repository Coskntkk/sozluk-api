// Db
const { User } = require("../db/models");
// 3rd party
const jwt = require("jsonwebtoken");
// Utils
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Checks if the client is authenticated
const checkAuthentication = () => {
    return catchAsync(async (req, res, next) => {
        try {
            const token = req.headers["x-access-token"];
            if (!token) throw new AppError('No token, authorization denied', 401)
            const tokenDecoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            const cnt = await User.count({ where: { id: tokenDecoded.user.id } })
            if (!cnt || cnt <= 0)
                throw new AppError('No token, authorization denied', 401)
            req.user = tokenDecoded.user
            // Continue
            next();
        } catch (error) {
            next(error)
        }
    });
};

// Export
module.exports = checkAuthentication;