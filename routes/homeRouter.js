const router = require('express').Router();
const { getEntriesByTitleId } = require('../controllers/entryController');
const { getLatestTitle } = require('../controllers/titleController');


// Middlewares
const checkPagination = require('../middlewares/checkPagination');
const checkUser = require('../middlewares/checkUser');

// Set routes
//* /api/v1/home/
// Get latest title
router.get(
    "/latest",
    checkUser(),
    checkPagination(),
    async (req, res, next) => {
        try {
            let title = await getLatestTitle()
            let entries = await getEntriesByTitleId(title.id)
            // Return response
            res.status(200).json({
                success: true,
                data: {
                    total: entries.count,
                    total_pages: Math.ceil(entries.count / 10),
                    title: title,
                    items: entries.rows
                }
            });
        } catch (error) {
            next(error)
        }
    }
);

// Export router
module.exports = router;