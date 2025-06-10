const router = require("express").Router();
const { getEntriesByTitleId, countEntriesWithParam } = require("../controllers/entryController");
const { countFollowsByParams } = require("../controllers/followController");
const { getLatestTitle, getAllTitles } = require("../controllers/titleController");
const checkAuthentication = require("../middlewares/checkAuthentication");

// Set routes
//* /api/v1/home/
// Get latest title
router.get(
  "/latest",
  async (req, res, next) => {
    try {
      let title = await getLatestTitle();
      let entries = await getEntriesByTitleId(title.id, { page: 1, limit: 10 }, req.user);
      // Return response
      res.status(200).json({
        success: true,
        data: {
          total: entries.count,
          total_pages: Math.ceil(entries.count / 10),
          title: title,
          items: entries.rows,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get left frame titles
router.get(
  "/leftframe",
  async (req, res, next) => {
    try {
      const limit = 15;
      const page = 1;
      // Find all titles
      let titles = await getAllTitles({ limit, page });
      // Return response
      res.status(200).json({
        success: true,
        data: {
          page: page,
          limit: limit,
          total: titles.count,
          items: titles.rows,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get right frame info
router.get(
  "/rightframe",
  checkAuthentication(),
  async (req, res, next) => {
    try {
      const entryCount = await countEntriesWithParam({ user_id: req.user.id });
      const followerCount = await countFollowsByParams({ following_id: req.user.id })
      const followingCount = await countFollowsByParams({ follower_id: req.user.id })
      // Return response
      res.status(200).json({
        success: true,
        data: {
          entryCount: entryCount,
          followerCount: followerCount,
          followingCount: followingCount
        }
      });
    } catch (error) {
      next(error);
    }
  },
);

// Export router
module.exports = router;
