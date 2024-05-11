// Db
const sequelize = require("sequelize");
const { Title, Entry, User } = require("../db/models");
// Utils
const AppError = require("../utils/appError");

const createEntry = async (data) => {
    const { titleId, message, user } = data;
    const title = await Title.findByPk(titleId);
    if (!title) throw new AppError("Title not found", 404);
    // Create entry
    return await Entry.create({ message, title_id: titleId, user_id: user.id });
}

const getEntriesByTitleId = async (titleId) => {
    return await Entry.findAndCountAll({
        where: { title_id: titleId },
        limit: 10,
        offset: 0,
        attributes: {
            exclude: ["user_id", "title_id"],
            include: [
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
        },
        include: [
            {
                model: User,
                attributes: ["id", "username"],
            },
        ],
    })
}

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

const getEntryByParams = async (params) => {
    return await Entry.findAndCountAll({
        where: { ...params },
        limit: 10,
        offset: 0,
        attributes: {
            exclude: ["user_id", "title_id"],
            include: [
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
        },
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
    })
}

const updateEntryByParam = async (where, data) => {
    let entry = await Entry.findOne({ where: where })
    if (!entry) throw new AppError("Entry not found.", 404);
    Object.keys(data).forEach((key) => {
        entry[key] = data[key]
    })
    await entry.save()
    return entry.toJSON()
}

const deleteEntryByParam = async (where) => {
    // Find Entry
    const entry = await Entry.findOne({ where: where });
    if (!entry) throw new AppError("Entry not found", 404);
    // Delete Entry
    await entry.destroy();
};

module.exports = {
    createEntry,
    getEntriesByTitleId,
    getEntryByParams,
    getEntriesByParams,
    updateEntryByParam,
    deleteEntryByParam,
}

