const router = require('express').Router();
const { where } = require('sequelize');
const { getEntryByParams, deleteEntryByParam } = require('../controllers/entryController');
const { acclevel, createAndWhere } = require('../controllers/scopes');
const { getVoteByParam, createVote, deleteVoteByParams } = require('../controllers/voteController');
const { Entry, Vote } = require('../db/models');

// Middlewares
const checkAuthentication = require('../middlewares/checkAuthentication');
const checkAuthorization = require('../middlewares/checkAuthorization');
const checkReqBody = require('../middlewares/checkReqBody');
const checkReqParams = require('../middlewares/checkReqParams');

//* /api/v1/entries/
// Get an entry by id
router.get(
    "/:id",
    checkAuthorization("entry_read"),
    async (req, res, next) => {
        try {
            const { id } = req.params
            // Find entry
            const entry = await getEntryByParams({ id })
            // Check if user has voted
            if (req.user) {
                const existingVote = await getVoteByParam({ user_id: req.user.id, entry_id: entry.id });
                entry.userUpvote = existingVote ? existingVote.is_upvote : null;
            }
            // Send response
            res.status(200).json({
                success: true,
                data: entry
            });
        } catch (error) {
            next(error)
        }
    }
);

// Update an entry by id
router.put(
    "/:id",
    checkAuthentication(),
    checkAuthorization("entry_update"),
    checkReqParams(["id"]),
    checkReqBody(["message"]),
    async (req, res, next) => {
        try {
            const { id } = req.params
            // Update entry
            const entry = await Entry.findByPk(id);
            // Send response
            res.status(200).json({
                success: true,
                data: entry
            });
        } catch (error) {
            next(error)
        }
    }
);

// Delete an entry by id
router.delete(
    "/:id",
    checkAuthentication(),
    checkAuthorization("entry_delete"),
    checkReqParams(["id"]),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            // Delete entry
            await deleteEntryByParam({ id: id })
            // Send response
            res.status(200).json({
                success: true,
                data: null,
            });
        } catch (error) {
            next(error)
        }
    }
);

// Vote an entry
router.post(
    "/:id/votes",
    checkAuthentication(),
    checkAuthorization("vote_create"),
    checkReqParams(["id"]),
    checkReqBody(["is_upvote"]),
    async (req, res, next) => {
        try {
            const { id } = req.params
            const { is_upvote } = req.body;
            // Vote
            const data = { userId: req.user.id, entryId: id, is_upvote }
            const vote = await createVote(data)
            // Send response
            res.status(200).json({
                success: true,
                data: vote
            });
        } catch (error) {
            next(error)
        }
    }
);

// Unvote an entry
router.delete(
    "/:id/votes",
    checkAuthentication(),
    checkAuthorization("vote_delete"),
    checkReqParams(["id"]),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            // Delete Vote
            await deleteVoteByParams({ id })
            // Send response
            res.status(200).json({
                success: true,
                data: null
            });
        } catch (error) {
            next(error)
        }
    }
);

// Export router
module.exports = router;