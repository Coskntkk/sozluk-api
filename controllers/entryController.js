// Db
const sequelize = require("sequelize");
const { Title, Entry, User, Vote } = require("../db/models");
// Utils
const AppError = require("../utils/appError");

const createEntry = async (titleId, message, user) => {
    const title = await Title.findByPk(id);
    if (!title) throw new AppError("Title not found", 404);
    // Create entry
    const entry = await Entry.create({ message, title_id: titleId, user_id: user.id });
    // Return response
    let response = await Entry.findOne({
        where: { id: entry.id },
        attributes: { exclude: ["user_id"] },
        include: [
            {
                model: User,
                attributes: ["username", "id", "created_at"],
            }
        ],
    });
    return response.toJSON()
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

const updateEntryByParam = async (param, data) => {
    const entry = await Entry.findOne({ where: { ...param } })
    if (!entry) throw new AppError('Entry not found.', 400)
    Object.keys(data).forEach((key) => {
        entry[key] = data[key]
    })
    await entry.save()
    return entry.toJSON()
}

const deleteEntryByParam = async (params) => {
    // Find Entry
    const entry = await Entry.findOne({ where: { ...params } });
    if (!entry) throw new AppError("Entry not found", 404);
    // Delete Entry
    await entry.destroy();
};

module.exports = {
    createEntry,
    getEntriesByTitleId,
    getEntryByParams,
    updateEntryByParam,
    deleteEntryByParam,
}

