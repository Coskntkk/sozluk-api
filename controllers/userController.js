// Db
const { User, Role } = require("../db/models");
const AppError = require("../utils/appError");
// Utils

const getUsers = async (data) => {
    const { limit, page } = data
    const users = await User.findAndCountAll({
        offset: (page - 1) * limit,
        limit: limit,
        order: [["created_at", "DESC"]],
        attributes: { exclude: ["password", "refresh_token", "access_token"] },
        include: [{ model: Role, attributes: ["name", "id"] }]
    });
    return users
}

const getUserByParam = async (param) => {
    return await User.findOne({
        where: { ...param },
        attributes: { exclude: ["password", "refresh_token", "access_token", "role_id"] },
        include: [{ model: Role, attributes: ["name", "id"] }]
    })
}

const updateUserByParam = async (param, data) => {
    const user = await User.findOne({ where: { ...param } })
    if (!user) throw new AppError('User not found.', 400)
    Object.keys(data).forEach((key) => {
        user[key] = data[key]
    })
    await user.save()
    return user.toJSON()
}


module.exports = {
    getUsers,
    getUserByParam,
    updateUserByParam,
}