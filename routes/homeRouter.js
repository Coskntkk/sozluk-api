const router = require("express").Router();
const { getEntriesByTitleId } = require("../controllers/entryController");
const { getLatestTitle } = require("../controllers/titleController");

// Set routes
//* /api/v1/home/
// Get latest title
router.get(
  "/latest",
  async (req, res, next) => {
    try {
      let title = await getLatestTitle();
      let entries = await getEntriesByTitleId(title.id, { page: 1, limit: 10 });
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

// Export router
module.exports = router;
