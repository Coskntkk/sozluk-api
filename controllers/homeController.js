// Db
const { Title, Entry, User } = require("../db/models");
// 3rd party
const sequelize = require("sequelize");
// Utils
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Get latest title
// GET /api/v1/home/latest
exports.getLatestTitle = catchAsync(async (req, res, next) => {
    // Find latest updated title
    const title = await Title.findOne({
        limit: 1,
        offset: 0,
        order: [
            ["updated_at", "DESC"]
        ],
    });
    // Find entries
    const entries = await Entry.findAndCountAll({
        limit: 10,
        offset: 0,
        order: [
            ["created_at", "ASC"]
        ],
        where: { title_id: title.id },
        include: [
            {
                model: User,
                attributes: ["username", "id", "created_at", "image_url"],
            }
        ],
        attributes: {
            include: [
                [
                    sequelize.literal(`(
                        SELECT is_upvote
                        FROM vote
                        WHERE vote.entry_id = entry.id AND vote.user_id = ${req.user ? req.user.id : 0}
                    )`),
                    "userVote"
                ],
                [
                    (sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM vote
                        WHERE vote.entry_id = entry.id AND vote.is_upvote = true
                    ) - (
                        SELECT COUNT(*)
                        FROM vote
                        WHERE vote.entry_id = entry.id AND vote.is_upvote = false
                    )`)),
                    "points"
                ],
            ]
        }
    });
    // Return response
    res.status(200).json({
        status: "success",
        message: "Latest title fetched successfully",
        data: {
            total: entries.count,
            title: title,
            items: entries.rows,
        }
    });
});
