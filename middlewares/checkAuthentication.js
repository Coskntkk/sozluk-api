// Db
const { User } = require("../db/models");
// 3rd party
const jwt = require("jsonwebtoken");
// Utils
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { checkIsAccessTokenValid } = require("../utils/authFunctions");
const { getAccessToken } = require("../utils/authCookies");

const checkAuthentication = () => {
  return catchAsync(async (req, res, next) => {
    try {
      const token = getAccessToken(req);
      if (!token) throw new AppError("No token, authorization denied", 401);

      // Sadece access token doğrulanır
      const tokenDecoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (!tokenDecoded.user?.id) {
        throw new AppError("No token, authorization denied", 401);
      }

      const user = await User.findOne({
        where: { id: tokenDecoded.user.id },
        attributes: ["id", "is_active", "refresh_token"],
      });

      if (!user || !user.is_active) {
        throw new AppError("User not found or inactive", 401);
      }

      // Eğer access token'ları DB/Redis üzerinde de blacklist kontrolü vb. yapıyorsan:
      const sessionValid = await checkIsAccessTokenValid(token, user);
      if (!sessionValid) {
        throw new AppError("Session invalid", 401);
      }

      req.user = tokenDecoded.user;
      return next();
    } catch (error) {
      // Eğer hata token süresinin dolmasıysa, frontend'in (Axios interceptor) 
      // bunu anlayabilmesi için spesifik bir mesaj veya hata kodu dönüyoruz.
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Access token expired" });
      }
      return next(error);
    }
  });
};

module.exports = checkAuthentication;
