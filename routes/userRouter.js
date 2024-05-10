const router = require('express').Router();
const { User, Entry, Title } = require('../db/models');

// Middlewares
const checkAuthentication = require('../middlewares/checkAuthentication');
const checkAuthorization = require('../middlewares/checkAuthorization');
const checkReqBody = require('../middlewares/checkReqBody');
const checkReqParams = require('../middlewares/checkReqParams');
const checkPagination = require('../middlewares/checkPagination');
const { getUsers, getUserByParam, updateUserByParam } = require('../controllers/userController');

// Set routes
//* /api/v1/users/
// Get all users
router.get(
    "/",
    checkPagination(),
    checkAuthorization("user_read", User),
    async (req, res) => {
        try {
            const users = await getUsers(req.query)
            // Return response
            res.status(200).json({
                success: true,
                data: {
                    page: page,
                    limit: limit,
                    total: users.count,
                    items: users.rows,
                }
            });
        } catch (error) {
            next(error)
        }
    }
);

// Get user by username
router.get(
    "/:username",
    checkReqParams(["username"]),
    checkAuthorization("user_read", User),
    async (req, res, next) => {
        try {
            const { username } = req.params;
            // Find user
            const user = await getUserByParam({ username: username })
            // Return response
            res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error)
        }
    }
);

// Update user by id
router.put(
    "/:id",
    checkAuthentication(),
    checkAuthorization("user_update", User),
    checkReqParams(["id"]),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            // Update use
            const user = await updateUserByParam({ id }, req.body)
            // Return response
            res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error)
        }
    }
);

const getEntriesByParams = async (data, params) => {
    const { limit, page } = data
    const entries = await Entry.findAndCountAll({
        offset: (page - 1) * limit,
        // limit: limit,
        order: [["created_at", "DESC"]],
        where: { ...params },
        include: [
            {
                model: Title,
                attributes: ["name", "id", "slug"],
            },
        ]
    });
    return entries
}

// Get entries by user username
router.get(
    "/:id/entries",
    checkAuthorization("entry_read", Entry),
    checkReqParams(["id"]),
    checkPagination(),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { page, limit } = req.query;
            const entries = await getEntriesByParams(req.query, { user_id: id })
            // Return response
            res.status(200).json({
                success: true,
                data: {
                    page: page,
                    limit: limit,
                    total: entries.count,
                    items: entries.rows,
                }
            });
        } catch (error) {
            next(error)
        }
    }
);

// Export router
module.exports = router;