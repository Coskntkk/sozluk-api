// Utils
const scopes = require('../utils/scopes.json');
const AppError = require("../utils/appError");

let notAuthMessage = "You are not authorized to perform this action";

// Checks if the client's role is in the given list of roles
const checkAuthorization = (action) => {
  return async (req, res, next) => {
    try {
      // Find scope
      const scope = scopes[action];
      if (!scope) throw new AppError("Something went wrong.", 500);
      // Check if the client's role is in the given list of roles
      let role;
      if (!req.user) role = "guest";
      else role = global.roles[req.user.role].name
      // Find access
      const access = scope[role];
      // Check access
      if (!access) throw new AppError(notAuthMessage, 403)
      switch (access) {
        case "own": // If access is own, check if the user is the owner of the item or related item
          req.own = true
          break
        case "no": // If access is no, return error
          throw new AppError(notAuthMessage, 403);
        default:
          break;
      }
      // Continue
      next();
    } catch (error) {
      console.log(error);
      res.status(400).send({ success: false, message: error.message, data: null });
    }
  };
};

// Export
module.exports = checkAuthorization;