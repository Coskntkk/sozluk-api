const router = require('express').Router();
const { Entry, Vote } = require('../db/models');

// Middlewares
const checkAuthentication = require('../middlewares/checkAuthentication');
const checkAuthorization = require('../middlewares/checkAuthorization');
const checkReqBody = require('../middlewares/checkReqBody');
const checkReqParams = require('../middlewares/checkReqParams');

// Import controllers
const entryController = require('../controllers/entryController');

// Set routes
//* /api/v1/entries/
// Get an entry by id
router.get("/:id", checkAuthentication("entry_read", Entry), entryController.getEntryById);

// Update an entry by id
router.put(
    "/:id",
    checkAuthentication(),
    checkAuthorization("entry_update", Entry),
    checkReqParams(["id"]),
    checkReqBody(["message"]),
    entryController.updateEntryById
);

// Delete an entry by id
router.delete(
    "/:id",
    checkAuthentication(),
    checkAuthorization("entry_delete", Entry),
    checkReqParams(["id"]),
    entryController.deleteEntryById
);

// Vote an entry
router.post(
    "/:id/votes",
    checkAuthentication(),
    checkAuthorization("vote_create", Vote),
    checkReqParams(["id"]),
    checkReqBody(["is_upvote"]),
    entryController.voteEntryById
);

// Unvote an entry
router.delete(
    "/:id/votes",
    checkAuthentication(),
    checkAuthorization("vote_delete", Vote),
    checkReqParams(["id"]),
    entryController.unvoteEntryById
);

// Export router
module.exports = router;