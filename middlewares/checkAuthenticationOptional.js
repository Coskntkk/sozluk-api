// Db
const { User } = require("../db/models");
// 3rd party
const jwt = require("jsonwebtoken");
// Utils
const catchAsync = require("../utils/catchAsync");

// Checks if the client is authenticated
const checkAuthenticationOptional = () => {
  return catchAsync(async (req, res, next) => {
    try {
      const token = req.headers["x-access-token"];
      if (!token)
        return next();
      const tokenDecoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const cnt = await User.count({ where: { id: tokenDecoded.user.id } });
      if (!cnt || cnt <= 0)
        return next();
      req.user = tokenDecoded.user;
      res.header("x-access-token", token);
      // Continue
      return next();
    } catch (error) {
      console.log(error);
      next();
    }
  });
};

// Export
module.exports = checkAuthenticationOptional;
