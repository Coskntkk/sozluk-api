// Configure the request
const configureReq = () => {
  return function (req, res, next) {
    try {
      // Set language
      let lang = req.headers["accept-language"] || "en";
      req.msg = global.responses[lang] || global.responses["en"];
      // Continue
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Export
module.exports = configureReq;
