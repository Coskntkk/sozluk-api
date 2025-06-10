const router = require("express").Router();

const slugify = require("slugify");

// Middlewares
const checkAuthentication = require("../middlewares/checkAuthentication");
const checkAuthorization = require("../middlewares/checkAuthorization");
const checkReqBody = require("../middlewares/checkReqBody");
const checkReqParams = require("../middlewares/checkReqParams");
const checkPagination = require("../middlewares/checkPagination");
const {
  getTitleByParams,
  getAllTitles,
  createTitle,
} = require("../controllers/titleController");
const {
  getEntriesByTitleId,
  createEntry,
} = require("../controllers/entryController");
const AppError = require("../utils/appError");
const { createOrWhere } = require("../controllers/scopes");

// Set routes
//* /api/v1/titles/
// Get all titles
router.get(
  "/",
  checkPagination(),
  async (req, res, next) => {
    try {
      const { limit, page } = req.query;
      // Find all titles
      let titles = await getAllTitles(req.query);
      // Return response
      res.status(200).json({
        success: true,
        data: {
          page: page,
          limit: limit,
          total_pages: Math.ceil(titles.count / limit),
          total: titles.count,
          items: titles.rows,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// Create new title
router.post(
  "/",
  checkAuthentication(),
  checkAuthorization("title_create"),
  checkReqBody(["name", "message"]),
  async (req, res, next) => {
    try {
      let { name, message } = req.body;
      name = name.trim().toLowerCase().substring(0, 70);
      message = message.trim().toLowerCase().substring(0, 280);
      // Create title
      let title = await createTitle(name);
      // Create entry
      let entry = await createEntry({
        titleId: title.id,
        message,
        user: req.user,
      });
      title.entries = [entry];
      // Return response
      res.status(201).json({
        success: true,
        message: "Title created.",
        data: title,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get title by slug or id
router.get(
  "/:id",
  checkPagination(),
  checkReqParams(["id"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { page, limit } = req.query;
      // Find title
      let opt = [];
      if (isNaN(id)) {
        opt.push({ slug: id });
        opt.push({ slug: slugify(id) });
      } else opt.push({ id: id });
      let where = createOrWhere(opt);
      let title = await getTitleByParams(where);
      if (!title) throw new AppError("Title not found.", 400);
      let entries = await getEntriesByTitleId(title.id, req.query, req.user);
      // Return response
      res.status(200).json({
        success: true,
        data: {
          page: page,
          total_pages: Math.ceil(entries.count / 10),
          limit: limit,
          total: entries.count,
          title: title,
          items: entries.rows,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// Create entry by title id
router.post(
  "/:id/entries",
  checkAuthentication(),
  checkAuthorization("entry_create"),
  checkReqParams(["id"]),
  checkReqBody(["message"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      let { message } = req.body;
      message = message.trim().toLowerCase().substring(0, 280);
      // Create entry
      let data = { titleId: id, message, user: req.user };
      const entry = await createEntry(data);
      res.status(201).json({
        success: true,
        message: "Entry created.",
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Export router
module.exports = router;
