// Db
const { Title, Entry, User, Vote } = require("../db/models");
// 3rd party
const slugify = require('slugify');
const sequelize = require("sequelize");
// Utils
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Get all titles
// GET /api/v1/titles
exports.getAllTitles = catchAsync(async (req, res) => {
    let { page, limit, keyword } = req.query;
    // Find all titles
    let titles = await Title.findAndCountAll({
        where: keyword ? { name: { [sequelize.Op.like]: `%${keyword}%` } } : {},
        offset: (page - 1) * limit,
        limit: limit,
        order: [
            ["created_at", "DESC"]
        ],
        // Include entry count
        attributes: {
            include:
                [
                    [
                        sequelize.literal(
                            `(
                                SELECT COUNT(*)
                                FROM entry
                                WHERE entry.title_id = title.id
                            )`
                        ),
                        "entry_count"
                    ]
                ],
        },
    });
    // Return response
    res.status(200).json({
        status: "success",
        message: "Latest titles fetched successfully",
        data: {
            page: page,
            limit: limit,
            total: titles.count,
            items: titles.rows,
        }
    });
});

// Create a title
// POST /api/v1/titles
exports.createTitle = catchAsync(async (req, res, next) => {
    let { name, message } = req.body;
    name = name.trim().toLowerCase().substring(0, 70);
    message = message.trim().toLowerCase().substring(0, 280);
    // Check if title already exists
    const titleExists = await Title.findOne({ where: { name } });
    if (titleExists) {
        return next(new AppError("Title already exists", 400));
    }
    // Create title
    let title = await Title.create({ name });
    title = title.toJSON();
    // Create entry
    let entry = await Entry.create({ message, title_id: title.id, user_id: req.user.id });
    entry = entry.toJSON();
    // Return response
    title = await Title.findOne({
        where: { id: title.id },
        include: {
            model: Entry,
            attributes: ["message"],
            include: {
                model: User,
                attributes: ["username", "id", "createdAt"]
            }
        }
    });
    // Return response
    res.status(201).json({
        status: "success",
        message: "Title created successfully",
        data: title
    });
});

// Get a title by slug or id
// GET /api/v1/titles/:id
exports.getTitleBySlugOrId = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { page, limit } = req.query;
    // Find title
    const title = await Title.findOne({
        where: {
            [sequelize.Op.or]: [
                { id: id },
                { slug: id },
                { slug: slugify(id) }
            ]
        },
    });
    if (!title) {
        return next(new AppError("Title not found", 404));
    }
    // Find entries
    const entries = await Entry.findAndCountAll({
        offset: (page - 1) * limit,
        limit: limit,
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
        message: "Entries fetched successfully",
        data: {
            page: page,
            limit: limit,
            total: entries.count,
            title: title,
            items: entries.rows,
        }
    });
});

// Update a title by id
// PUT /api/v1/titles/:id
exports.updateTitleById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;
    // Find title
    const title = await Title.findByPk(id);
    if (!title) {
        return next(new AppError("Title not found", 404));
    }
    // Update title
    title.name = name;
    title.slug = slugify(title.name, { lower: true });
    await title.save();
    // Return response
    res.status(200).json({
        status: "success",
        message: "Title updated successfully",
        data: title
    });
});

// Delete a title by id
// DELETE /api/v1/titles/:id
exports.deleteTitleById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // Find title
    const title = await Title.findByPk(id);
    if (!title) {
        return next(new AppError("Title not found", 404));
    }
    // Find all entries associated with the title
    const entries = await Entry.findAll({ where: { title_id: id } });
    // Find all votes associated with the entries
    const votes = await Vote.findAll({ where: { entry_id: entries.map(entry => entry.id) } });
    // Delete all votes
    await Vote.destroy({ where: { id: votes.map(vote => vote.id) } });
    // Delete all entries
    await Entry.destroy({ where: { id: entries.map(entry => entry.id) } });
    // Delete title
    await Title.destroy({ where: { id } });
    res.status(200).json({
        status: "success",
        message: "Title deleted successfully",
        data: null
    });
});

// Create an entry by title id
// POST /api/v1/titles/:id/entries
exports.createEntryByTitleId = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    let { message } = req.body;
    message = message.trim().toLowerCase().substring(0, 280);
    // Find title
    const title = await Title.findByPk(id);
    if (!title) {
        return next(new AppError("Title not found", 404));
    }
    // Create entry
    const entry = await Entry.create({ message, title_id: id, user_id: req.user.id });
    // Return response
    let response = await Entry.findOne({
        where: { id: entry.id },
        attributes: { exclude: ["user_id"] },
        include: [
            {
                model: User,
                attributes: ["username", "id", "created_at", "image_url"],
            }
        ],
    });
    res.status(201).json({
        status: "success",
        message: "Entry created successfully",
        data: response
    });
});
