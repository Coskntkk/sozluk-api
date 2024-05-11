// Db
const { Title, Entry, User, Vote } = require("../db/models");
// 3rd party
const sequelize = require("sequelize");
// Utils
const AppError = require("../utils/appError");

// Get all titles
const getAllTitles = async (params) => {
    let { page, limit, keyword } = params;
    let where = {}
    if (keyword) where = { name: { [sequelize.Op.like]: `%${keyword}%` } }
    const titles = await Title.findAndCountAll({
        where: where,
        offset: (page - 1) * limit,
        limit: limit,
        order: [["created_at", "DESC"]],
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
    return titles
}

// Get latest title
const getLatestTitle = async () => {
    return await Title.findOne({
        limit: 1,
        offset: 0,
        order: [["updated_at", "DESC"]],
        attributes: {
            include: [
                [
                    (sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM entry
                            WHERE entry.title_id = title.id
                        )`)),
                    "entry_count"
                ],
            ]
        }
    });
}

// Create a title
const createTitle = async (name) => {
    // Check if title already exists
    const titleExists = await Title.findOne({ where: { name } });
    if (titleExists) throw new AppError("Title already exists", 400);
    // Create title
    let title = await Title.create({ name });
    return title.toJSON();
};

// Get a title by slug or id
const getTitleByParams = async (where) => {
    return await Title.findOne({
        where: where,
        order: [
            ["updated_at", "DESC"]
        ],
        attributes: {
            include: [
                [
                    (sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM entry
                            WHERE entry.title_id = title.id
                        )`)),
                    "entry_count"
                ],
            ]
        }
    });
};

// Create an entry by title id
const createEntryByTitleId = async () => {
};

module.exports = {
    getAllTitles,
    getLatestTitle,
    createTitle,
    getTitleByParams,
    createEntryByTitleId
}
