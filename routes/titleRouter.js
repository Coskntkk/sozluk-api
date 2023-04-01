const router = require('express').Router();
const { Title } = require('../db/models');

// Middlewares
const checkAuthentication = require('../middlewares/checkAuthentication');
const checkAuthorization = require('../middlewares/checkAuthorization');
const checkReqBody = require('../middlewares/checkReqBody');
const checkReqParams = require('../middlewares/checkReqParams');
const checkPagination = require('../middlewares/checkPagination');

// Import controllers
const titleController = require('../controllers/titleController');

// Set routes
//* /api/v1/titles/
// Get all titles
router.get(
    "/",
    checkPagination(),
    checkAuthorization("title_read", Title),
    titleController.getAllTitles
);

// Create new title
router.post(
    "/",
    checkAuthentication(),
    checkAuthorization("title_create", Title),
    checkReqBody(["name", "message"]),
    titleController.createTitle
);

// Get title by slug or id
router.get(
    "/:slugorid",
    checkAuthorization("title_read", Title),
    checkReqParams(["slugorid"]),
    titleController.getTitleBySlugOrId
);

// Update title by id
router.put(
    "/:id",
    checkAuthentication(),
    checkAuthorization("title_update", Title),
    checkReqParams(["id"]),
    checkReqBody(["name"]),
    titleController.updateTitleById
);

// Delete title by id
router.delete(
    "/:id",
    checkAuthentication(),
    checkAuthorization("title_delete", Title),
    checkReqParams(["id"]),
    titleController.deleteTitleById
);

// Get entries by title id
router.get(
    "/:id/entries",
    checkReqParams(["id"]),
    checkAuthorization("entry_read", Title),
    checkPagination(),
    titleController.getEntriesByTitleId
);

// Create entry by title id
router.post(
    "/:id/entries",
    checkAuthentication(),
    checkAuthorization("entry_create", Title),
    checkReqParams(["id"]),
    checkReqBody(["message"]),
    titleController.createEntryByTitleId
);

// Export router
module.exports = router;