// Db
const { User } = require("../db/models");
// 3rd party
const jwt = require("jsonwebtoken");
// Utils
const catchAsync = require("../utils/catchAsync");
const { checkIsAccessTokenValid } = require("../utils/authFunctions");
const { getAccessToken } = require("../utils/authCookies");

const checkAuthenticationOptional = () => {
  return catchAsync(async (req, res, next) => {
    req.user = null;
    try {
      const token = getAccessToken(req);
      if (!token) return next();

      const tokenDecoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (!tokenDecoded.user?.id) return next();

      const user = await User.findOne({
        where: { id: tokenDecoded.user.id },
        attributes: ["id", "is_active"],
      });
      if (!user || !user.is_active) return next();

      const sessionValid = await checkIsAccessTokenValid(token, user);
      if (!sessionValid) return next();

      req.user = tokenDecoded.user;
      return next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Access token expired" });
      }
      return next();
    }
  });
};

module.exports = checkAuthenticationOptional;