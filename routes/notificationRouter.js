const router = require("express").Router();
const { getNotificationsByUserId, readNotification } = require("../controllers/notificationController");
const checkAuthentication = require("../middlewares/checkAuthentication");
const checkPagination = require("../middlewares/checkPagination");
const checkReqParams = require("../middlewares/checkReqParams");

// Set routes
//* /api/v1/notification/
// Get notifications
router.get(
    "/",
    checkAuthentication(),
    checkAuthentication(),
    checkPagination(),
    async (req, res, next) => {
        try {
            const { limit, page } = req.query;
            let notifications = await getNotificationsByUserId(req.user.id, { page, limit });
            // Return response
            console.log(notifications);
            res.status(200).json({
                success: true,
                data: {
                    page: page,
                    limit: limit,
                    total_pages: Math.ceil(notifications.count / limit),
                    total: notifications.count,
                    items: notifications.rows,
                },
            });
        } catch (error) {
            next(error);
        }
    },
);

// Read notification
router.get(
    "/:id/read",
    checkAuthentication(),
    checkReqParams(["id"]),
    async (req, res, next) => {
        try {
            const { id } = req.params
            // Find all titles
            await readNotification(id);
            // Return response
            res.status(200).json({
                success: true,
                data: {},
            });
        } catch (error) {
            next(error);
        }
    },
);

// Export router
module.exports = router;
