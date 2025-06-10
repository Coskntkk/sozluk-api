const router = require("express").Router();

// Middlewares
const checkAuthentication = require("../middlewares/checkAuthentication");
const checkAuthorization = require("../middlewares/checkAuthorization");
const checkReqParams = require("../middlewares/checkReqParams");
const checkPagination = require("../middlewares/checkPagination");

// Controllers
const {
  // getUsers,
  updateUserByParam,
  getUserByParams,
} = require("../controllers/userController");
const { getEntriesByParams } = require("../controllers/entryController");
const { createOrWhere } = require("../controllers/scopes");
const { getFollowByParams, createFollow } = require("../controllers/followController");
const AppError = require("../utils/appError");

// Set routes

// //* /api/v1/users/
// // Get all users
// router.get(
//   "/",
//   checkPagination(),
//   checkAuthorization("user_read"),
//   async (req, res, next) => {
//     try {
//       const users = await getUsers(req.query);
//       // Return response
//       res.status(200).json({
//         success: true,
//         data: {
//           // page: page,
//           // limit: limit,
//           total: users.count,
//           items: users.rows,
//         },
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
// );

// Get user by username or id
router.get(
  "/:username",
  checkReqParams(["username"]),
  checkAuthorization("user_read"),
  async (req, res, next) => {
    try {
      const { username } = req.params;
      // Find title
      let opt = [];
      if (isNaN(username)) opt.push({ username: username });
      else opt.push({ id: username });
      let where = createOrWhere(opt);
      // Find user
      const user = await getUserByParams(where);
      // Return response
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Update user by id
router.put(
  "/:username",
  checkAuthentication(),
  checkAuthorization("user_update"),
  checkReqParams(["username"]),
  async (req, res, next) => {
    try {
      const { username } = req.params;
      // Update use
      const user = await updateUserByParam({ username }, req.body);
      // Return response
      res.status(200).json({
        success: true,
        message: "User updated.",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get entries by user id
router.get(
  "/:username/entries",
  checkAuthorization("entry_read"),
  checkReqParams(["username"]),
  checkPagination(),
  async (req, res, next) => {
    try {
      const { username } = req.params;
      const { page, limit } = req.query;
      let opt = [];
      if (isNaN(username)) opt.push({ username: username });
      else opt.push({ id: username });
      let where = createOrWhere(opt);
      const user = await getUserByParams(where)
      const entries = await getEntriesByParams(req.query, { user_id: user.id });
      // Return response
      res.status(200).json({
        success: true,
        data: {
          page: page,
          limit: limit,
          total: entries.count,
          items: entries.rows,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get entries by user id
router.get(
  "/:username/follow",
  checkReqParams(["username"]),
  async (req, res, next) => {
    try {
      const { username } = req.params;
      const userToFollow = await getUserByParams({ username })
      if (!userToFollow || !req.user) throw new AppError('User not found.', 404)
      const body = {
        following_id: userToFollow.id,
        follower_id: req.user.id
      }
      await getFollowByParams(body)
      const follow = await createFollow(body)
      // Return response
      res.status(200).json({
        success: true,
        data: follow
      });
    } catch (error) {
      next(error);
    }
  },
);

// Export router
module.exports = router;
