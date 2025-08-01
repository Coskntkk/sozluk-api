const router = require("express").Router();
const {
  getEntryByParams,
  deleteEntryByParam,
  updateEntryByParam,
  getRawEntryByParams,
} = require("../controllers/entryController");
const { createNotification } = require("../controllers/notificationController");
const { acclevelOwner, createAndWhere } = require("../controllers/scopes");
const {
  getVoteByParam,
  createVote,
  deleteVoteByParams,
} = require("../controllers/voteController");

// Middlewares
const checkAuthentication = require("../middlewares/checkAuthentication");
const checkAuthorization = require("../middlewares/checkAuthorization");
const checkReqBody = require("../middlewares/checkReqBody");
const checkReqParams = require("../middlewares/checkReqParams");
const AppError = require("../utils/appError");

//* /api/v1/entries/
// Get an entry by id
router.get(
  "/:id",
  checkReqParams(["id"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      // Find entry
      const entry = await getEntryByParams({ id }, req.user);
      // Send response
      res.status(200).json({
        success: true,
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  });

// Update an entry by id
router.put(
  "/:id",
  checkAuthentication(),
  checkAuthorization("entry_update"),
  checkReqParams(["id"]),
  checkReqBody(["message"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      // Update entry
      let opt = acclevelOwner(req.own, req.user);
      opt.push({ id: id });
      let where = createAndWhere(opt);
      let entry = await updateEntryByParam(where, { message });
      // Send response
      res.status(200).json({
        success: true,
        message: "Entry updated.",
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  },
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
      let opt = acclevelOwner(req.own, req.user);
      opt.push({ id: id });
      let where = createAndWhere(opt);
      await deleteEntryByParam(where);
      // Send response
      res.status(200).json({
        success: true,
        message: "Entry deleted.",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  },
);

// Vote an entry
router.post(
  "/:id/votes",
  checkAuthentication(),
  checkAuthorization("vote_create"),
  checkReqParams(["id"]),
  checkReqBody(["value"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { value } = req.body;
      // Check if exists
      const existingVote = await getVoteByParam({
        user_id: req.user.id,
        entry_id: id,
      });
      if (existingVote)
        throw new AppError("Entry already voted.", 404);
      // Vote
      const data = { userId: req.user.id, entryId: id, value };
      const vote = await createVote(data);
      // Notification
      const entry = await getRawEntryByParams({ id: id })
      await createNotification({
        message: `entry_${value === 1 ? "up" : "down"}voted`,
        link: `/e/${id}`,
        read: false,
        user_id: entry.user_id
      })
      // Send response
      res.status(200).json({
        success: true,
        message: "Entry voted.",
        data: vote,
      });
    } catch (error) {
      next(error);
    }
  },
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
      // Check existing
      const existingVote = await getVoteByParam({
        user_id: req.user.id,
        entry_id: id,
      });
      if (!existingVote)
        throw new AppError("Not voted.", 404);
      // Delete Vote
      let opt = acclevelOwner(req.own, req.user);
      opt.push({ id: existingVote.id });
      let where = createAndWhere(opt);
      await deleteVoteByParams(where);
      // Send response
      res.status(200).json({
        success: true,
        message: "Entry unvoted.",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  },
);

// Export router
module.exports = router;
