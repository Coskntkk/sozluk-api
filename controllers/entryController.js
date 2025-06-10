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
};

const getEntriesByTitleId = async (titleId, query, user) => {
  const { page, limit } = query;
  const include = [
    [
      sequelize.literal(`(
        SELECT COALESCE(SUM("value"), 0) 
        FROM vote 
        WHERE vote.entry_id = entry.id
      )`),
      "point",
    ]
  ]
  if (user)
    include.push([
      sequelize.literal(`(
        SELECT value
        FROM vote
        WHERE vote.entry_id = entry.id AND vote.user_id = ${user.id}
        LIMIT 1
      )`),
      "userVote"
    ])
  return await Entry.findAndCountAll({
    where: { title_id: titleId },
    limit: limit,
    offset: limit * (page - 1),
    attributes: {
      exclude: ["user_id", "title_id"],
      include: include,
    },
    include: [
      {
        model: User,
        attributes: ["id", "username"],
      },
    ],
  });
};

const getEntriesByParams = async (data, params) => {
  const { limit, page } = data;

  const entries = await Entry.findAndCountAll({
    offset: (page - 1) * limit,
    limit: limit,
    order: [["created_at", "DESC"]],
    where: { ...params },
    include: [
      {
        model: Title,
        attributes: ["name", "id", "slug"],
      },
    ],
  });
  return entries;
};

const getRawEntryByParams = async (where) => {
  const entry = await Entry.findOne(...where)
  if (!entry) throw new AppError('Entry not found.', 404)
  return entry
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
          sequelize.literal(`(
            SELECT COALESCE(SUM("value"), 0) 
            FROM vote 
            WHERE vote.entry_id = entry.id
          )`),
          "points",
        ],
      ],
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
  });
};

const updateEntryByParam = async (where, data) => {
  let entry = await Entry.findOne({ where: where });
  if (!entry) throw new AppError("Entry not found.", 404);
  Object.keys(data).forEach((key) => {
    entry[key] = data[key];
  });
  await entry.save();
  return entry.toJSON();
};

const deleteEntryByParam = async (where) => {
  // Find Entry
  const entry = await Entry.findOne({ where: where });
  if (!entry) throw new AppError("Entry not found", 404);
  // Delete Entry
  await entry.destroy();
};

const countEntriesWithParam = async (where) => {
  const count = await Entry.count({ where: where });
  return count
}

module.exports = {
  createEntry,
  getEntriesByTitleId,
  getRawEntryByParams,
  getEntryByParams,
  getEntriesByParams,
  updateEntryByParam,
  deleteEntryByParam,
  countEntriesWithParam
};
