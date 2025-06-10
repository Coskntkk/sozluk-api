const router = require("express").Router();
const { getNotificationsByUserId, readNotification } = require("../controllers/notificationController");
const checkAuthentication = require("../middlewares/checkAuthentication");
const checkReqParams = require("../middlewares/checkReqParams");

// Set routes
//* /api/v1/notification/
// Get notifications
router.get(
    "/",
    checkAuthentication(),
    checkAuthentication(),
    async (req, res, next) => {
        try {
            let notifications = await getNotificationsByUserId(req.user.id, { page: 1, limit: 10 });
            // Return response
            res.status(200).json({
                success: true,
                data: {
                    total: notifications.count,
                    total_pages: Math.ceil(notifications.count / 10),
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
