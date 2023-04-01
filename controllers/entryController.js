// Db
const { Title, Entry, User, Vote } = require("../db/models");
// Utils
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Get entry by id
// GET /api/v1/entries/:id
exports.getEntryById = catchAsync(async (req, res, next) => {
    // Find entry
    const entry = await Entry.findByPk(req.params.id, {
        attributes: { exclude: ["user_id", "title_id"]},
        include: [
            {
                model: Title,
                attributes: ["id", "name", "slug"],
            },
            {
                model: User,
                attributes: ["id", "username"],
            },
        ],
    });
    if (!entry) {
        return next(new AppError("Entry not found", 404));
    }
    // Find votes
    const votes = await Vote.findAll({ where: { entry_id: entry.id } });
    entry.dataValues.votes = votes.filter(vote => vote.is_upvote).length - votes.filter(vote => !vote.is_upvote).length;
    // Check if user has voted
    if (req.user) {
        const existingVote = await Vote.findOne({ where: { user_id: req.user.id, entry_id: entry.id } });
        if (existingVote) {
            entry.dataValues.voted = true;
            entry.dataValues.userUpvote = existingVote.is_upvote;
        } else {
            entry.dataValues.voted = false;
            entry.dataValues.userUpvote = null;
        }
    }
    // Send response
    res.status(200).json({
        success: true,
        message: "Entry fetched successfully",
        data: entry
    });
});

// Update entry by id
// PUT /api/v1/entries/:id
exports.updateEntryById = catchAsync(async (req, res, next) => {
    const { message } = req.body;
    // Find entry
    const entry = await Entry.findByPk(req.params.id);
    if (!entry) {
        return next(new AppError("Entry not found", 404));
    }
    // Update entry
    entry.message = message;
    await entry.save();
    // Send response
    res.status(200).json({
        success: true,
        message: "Entry updated successfully",
        data: entry
    });
});

// Delete entry by id
// DELETE /api/v1/entries/:id
exports.deleteEntryById = catchAsync(async (req, res) => {
    const { id } = req.params;
    // Find entry
    const entry = await Entry.findByPk(id);
    if (!entry) {
        return next(new AppError("Entry not found", 404));
    }
    // Delete entry
    await entry.destroy();
    // Send response
    res.status(200).json({
        success: true,
        message: "Entry deleted successfully",
        data: null,
    });
});

// Vote entry by id
// POST /api/v1/entries/:id/votes
exports.voteEntryById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { is_upvote } = req.body;
    // Find entry
    const entry = await Entry.findByPk(id);
    if (!entry) {
        return next(new AppError("Entry not found", 404));
    }
    // Check if user has already voted
    const existingVote = await Vote.findOne({ where: { user_id: req.user.id, entry_id: entry.id } });
    if (existingVote) {
        return next(new AppError("Entry already voted", 400));
    }
    // Create vote
    const vote = await Vote.create({
        user_id: req.user.id,
        entry_id: entry.id,
        is_upvote: !!is_upvote,
    });
    // Send response
    res.status(200).json({
        success: true,
        message: "Entry voted successfully",
        data: vote
    });
});

// Unvote entry by id
// DELETE /api/v1/entries/:id/votes
exports.unvoteEntryById = catchAsync(async (req, res) => {
    const { id } = req.params;
    // Find entry
    const entry = await Entry.findByPk(id);
    if (!entry) {
        return next(new AppError("Entry not found", 404));
    }
    // Delete vote
    await Vote.destroy({
        where: {
            user_id: req.user.id,
            entry_id: entry.id,
        },
    });
    // Send response
    res.status(200).json({
        success: true,
        message: "Entry unvoted successfully",
        data: entry
    });
});
