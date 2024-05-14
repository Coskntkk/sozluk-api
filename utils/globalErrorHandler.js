// NODE_ENV declaration
const NODE_ENV = process.env.NODE_ENV;
const { ErrorLog } = require("../db/models");

// Sending errors in development mode
const sendErrorDevelopment = (error, res) => {
  console.log("Error: ", error);
  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    data: {},
    dev:
      error.statusCode >= 500
        ? {
          status: error.status,
          error: error,
          stack: error.stack,
        }
        : null,
  });
};

// Sending errors in production mode
const sendErrorProduction = (error, res) => {
  // Operational errors that we can detect
  if (error.isOperational) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      data: {},
    });
  } else {
    // Errors we cannot detect
    res.status(500).json({
      success: false,
      message: "Something went wrong.",
      data: {},
    });
  }
};

const logErrorToDatabase = async (error) => {
  let errorObject = {
    message: error.message,
    stack: error.stack,
    status: error.status,
    statusCode: error.statusCode,
    isOperational: error.isOperational,
  };
  ErrorLog.create(errorObject)
    .then(() => console.log("Error logged to database"))
    .catch((error) => { console.log(error); console.log("Error logging to database") });
};

const globalErrorHandler = (error, req, res) => {
  // statusCode means the code of the status of the request and status is the actual status of the request(coming from the Error class)
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  //! Wrong JWT error
  if (error.name === "JsonWebTokenError") {
    error.message = `Json web Token is invalid, try again`;
  }

  //! JWT EXPIRE error
  if (error.name === "TokenExpiredError") {
    error.message = `Json web Token is expired, try again`;
  }
  // Logging errors to database
  error.statusCode >= 500 && logErrorToDatabase(error);

  if (NODE_ENV == "development") {
    sendErrorDevelopment(error, res);
  } else if (NODE_ENV == "production") {
    sendErrorProduction(error, res);
  }
};
module.exports = globalErrorHandler;
