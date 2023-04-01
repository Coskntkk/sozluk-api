// Utils
const scopes = require('../utils/scopes.json');
const AppError = require("../utils/appError");

// Checks if the client's role is in the given list of roles
const checkAuthorization = (action, model, param = "id") => {
  return async (req, res, next) => {
    try {
      // Find scope
      const scope = scopes[action];
      if (!scope) {
        return next(new AppError("Something went wrong", 500));
      }
      // Check if the client's role is in the given list of roles
      let role;
      if (!req.user) {
        role = "guest";
      } else {
        role = req.user.role.name;
      }
      // Find access
      const access = scope[role];
      // Check access
      if (!access) {
        return next(new AppError("You are not authorized to perform this action", 403));
      }
      switch (access) {
        case "own": // If access is own, check if the user is the owner of the item or related item
          if (model.name == "vote") {
            let item = await model.findOne({ where: { user_id: req.user.id, entry_id: req.params.id } });
            if (!item) {
              return next(new AppError("Item not found", 404));
            }
            if (item.user_id !== req.user.id) {
              return next(new AppError("You are not authorized to perform this action", 403));
            }
            break;
          } else if (model.name == "user") {
            let item = await model.findByPk(req.params.id);
            if (!item) {
              return next(new AppError("Item not found", 404));
            }
            if (item.id !== req.user.id) {
              return next(new AppError("You are not authorized to perform this action", 403));
            }
            break;
          } else {
            let item = await model.findByPk(req.params[param]);
            if (!item) {
              return next(new AppError("Item not found", 404));
            }
            if (item.user_id !== req.user.id) {
              return next(new AppError("You are not authorized to perform this action", 403));
            }
            break;
          }
        case "no": // If access is no, return error
          return next(new AppError("You are not authorized to perform this action", 403));
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