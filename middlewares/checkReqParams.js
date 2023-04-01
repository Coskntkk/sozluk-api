// Utils
const AppError = require("../utils/appError");

// Control the key value pairs of request params
const checkReqParams = (parameters) => {
    return function (req, res, next) {
        try {
            // Check if all parameters are provided
            let missingParams = [];
            parameters.map(parameter => {
                if (!req.params[parameter]) {
                    missingParams.push(parameter);
                }
            });
            // If any parameter is missing, return error
            if (missingParams.length > 0) {
                res.status(400).json({
                    success: false,
                    message: `Please provide ${missingParams.join(", ")}`,
                    data: null,
                });
                next(new AppError(`Please provide ${missingParams.join(", ")}`, 400));
            }
            // If all keys have a valid value, continue
            next();
        } catch (error) {
            console.log(error);
            res.status(400).send({ success: false, message: error.message, data: null });
        }
    };
}

// Export
module.exports = checkReqParams;