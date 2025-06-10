// Db
const { Follow } = require("../db/models");
const AppError = require("../utils/appError");

const getFollowByParams = async (where) => {
    const follow = await Follow.findOne({ where: where });
    if (!follow) throw new AppError('Follow not found.', 404)
}

const createFollow = async (params) => {
    return await Follow.create(params)
}

const deleteFollow = async (where) => {
    const follow = await Follow.findOne({ where })
    if (!follow) throw new AppError('Follow not found.', 404)
    await follow.destroy()
}

const countFollowsByParams = async (params) => {
    const count = await Follow.count({ where: { ...params } });
    return count
};

module.exports = {
    getFollowByParams,
    createFollow,
    deleteFollow,
    countFollowsByParams
};
