const router = require('express').Router();
const { Title } = require('../db/models');

// Middlewares
const checkAuthentication = require('../middlewares/checkAuthentication');
const checkAuthorization = require('../middlewares/checkAuthorization');
const checkReqBody = require('../middlewares/checkReqBody');
const checkReqParams = require('../middlewares/checkReqParams');
const checkPagination = require('../middlewares/checkPagination');
const checkUser = require('../middlewares/checkUser');

// Import controllers
const homeController = require('../controllers/homeController');

// Set routes
//* /api/v1/home/
// Get latest title
router.get(
    "/latest",
    checkUser(),
    checkPagination(),
    checkAuthorization("title_read", Title),
    homeController.getLatestTitle
);

// Export router
module.exports = router;