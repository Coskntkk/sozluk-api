// Control the key value pairs of request query
const checkPagination = () => {
  return function (req, res, next) {
    try {
      // Get page and limit
      let { page, limit } = req.query;
      // Set default values for page
      if (!page) page = 1;
      if (isNaN(page) || page < 1) page = 1;
      // Set default values for limit
      if (!limit || isNaN(limit)) limit = 10;
      if (limit < 1 || limit > 20) limit = 10;
      // Set query
      req.query.page = parseInt(page);
      req.query.limit = parseInt(limit);
      // Continue
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Export
module.exports = checkPagination;
