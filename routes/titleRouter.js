const router = require('express').Router();
const { Title } = require('../db/models');

const slugify = require('slugify');
const sequelize = require("sequelize");

// Middlewares
const checkAuthentication = require('../middlewares/checkAuthentication');
const checkAuthorization = require('../middlewares/checkAuthorization');
const checkReqBody = require('../middlewares/checkReqBody');
const checkReqParams = require('../middlewares/checkReqParams');
const checkPagination = require('../middlewares/checkPagination');
const checkUser = require('../middlewares/checkUser');
const { getTitleByParams, getAllTitles, createTitle } = require('../controllers/titleController');
const { getEntriesByTitleId, createEntry } = require('../controllers/entryController');
const AppError = require('../utils/appError');

// Set routes
//* /api/v1/titles/
// Get all titles
router.get(
    "/",
    checkPagination(),
    checkAuthorization("title_read", Title),
    async (req, res, next) => {
        try {
            // Find all titles
            let titles = getAllTitles(req.query)
            // Return response
            res.status(200).json({
                success: true,
                data: {
                    page: page,
                    limit: limit,
                    total: titles.count,
                    items: titles.rows,
                }
            });
        } catch (error) {
            next(error)
        }
    }
);

// Create new title
router.post(
    "/",
    checkAuthentication(),
    checkAuthorization("title_create", Title),
    checkReqBody(["name", "message"]),
    async (req, res, next) => {
        try {
            let { name, message } = req.body;
            name = name.trim().toLowerCase().substring(0, 70);
            message = message.trim().toLowerCase().substring(0, 280);
            // Create title
            let title = createTitle(name)
            // Create entry
            let entry = await createEntry(title.id, message, req.user)
            title.entries = [entry]
            // Return response
            res.status(201).json({
                success: true,
                data: title
            });
        } catch (error) {
            next(error)
        }
    }
);

// Get title by slug or id
router.get(
    "/:id",
    checkUser(),
    checkPagination(),
    checkAuthorization("title_read", Title),
    checkReqParams(["id"]),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { page, limit } = req.query;
            // Find title
            let title = await getTitleByParams({
                [sequelize.Op.or]: [
                    { id: id },
                    { slug: id },
                    { slug: slugify(id) }
                ]
            })
            if (!title) throw new AppError('Title not found.', 400)
            let entries = await getEntriesByTitleId(title.id)
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
                }
            });
        } catch (error) {
            next(error)
        }
    }
);

// Create entry by title id
router.post(
    "/:id/entries",
    checkAuthentication(),
    checkAuthorization("entry_create", Title),
    checkReqParams(["id"]),
    checkReqBody(["message"]),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            let { message } = req.body;
            message = message.trim().toLowerCase().substring(0, 280);
            // Create entry
            const entry = await createEntry(id, message, req.user)
            res.status(201).json({
                success: true,
                data: entry
            });
        } catch (error) {
            next(error)
        }
    }
);

// Export router
module.exports = router;