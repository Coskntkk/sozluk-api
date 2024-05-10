// NODE_ENV declaration
const NODE_ENV = process.env.NODE_ENV;
const { ErrorLog } = require('../db/models');

// Sending errors in development mode
const sendErrorDevelopment = (error, res) => {
  console.log("Error: ", error);
  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    data: null,
    dev: error.statusCode >= 500 ? {
      status: error.status,
      error: error,
      stack: error.stack
    } : null
  });
}

// Sending errors in production mode
const sendErrorProduction = (error, res) => {
  // Operational errors that we can detect
  if (error.isOperational) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      data: null,
    });
  } else {
    // Errors we cannot detect
    res.status(500).json({
      success: false,
      message: 'Something went wrong.',
      data: null
    });
  };
};

const logErrorToDatabase = async (error) => {
  let errorObject = {
    message: error.message,
    stack: error.stack,
    status: error.status,
    statusCode: error.statusCode,
    isOperational: error.isOperational
  };
  ErrorLog.create(errorObject)
    .then(() => console.log('Error logged to database'))
    .catch((err) => console.log('Error logging to database'));
};

const globalErrorHandler = (error, req, res, next) => {
  // statusCode means the code of the status of the request and status is the actual status of the request(coming from the Error class)
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  // Logging errors to database
  error.statusCode >= 500 && logErrorToDatabase(error);

  if (NODE_ENV == 'development') {
    sendErrorDevelopment(error, res);
  } else if (NODE_ENV == 'production') {
    sendErrorProduction(error, res);
  }
}
module.exports = globalErrorHandler;