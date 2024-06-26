// Utils
const AppError = require("../utils/appError");

// Control the key value pairs of request body
const checkReqBody = (parameters) => {
  return function (req, res, next) {
    try {
      // Check if all parameters are provided
      let missingParams = [];
      parameters.map((parameter) => {
        if (["", null, undefined].includes(req.body[parameter]))
          missingParams.push(parameter);
      });
      // If any parameter is missing, return error
      if (missingParams.length > 0) {
        res.status(400).json({
          success: false,
          message: `Please provide ${missingParams.join(", ")}`,
          data: {},
        });
        next(new AppError(`Please provide ${missingParams.join(", ")}`, 400));
      }
      // If all keys have a valid value, continue
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Export
module.exports = checkReqBody;
