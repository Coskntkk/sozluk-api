// Db
const { User, Role } = require("../db/models");
const AppError = require("../utils/appError");

const getUsers = async (data) => {
  const { limit, page } = data;
  const users = await User.findAndCountAll({
    offset: (page - 1) * limit,
    limit: limit,
    order: [["created_at", "DESC"]],
    attributes: { exclude: ["password", "refresh_token", "access_token"] },
    include: [{ model: Role, attributes: ["name", "id"] }],
  });
  return users;
};

const getUserByParams = async (where) => {
  return await User.findOne({
    where: where,
    attributes: {
      exclude: [
        "password",
        "refresh_token",
        "access_token",
        "role_id",
        "email_verify_token",
        "password_verify_token",
        "deletedAt",
      ],
    },
  });
};

const getUserByParamsAuth = async (where) => {
  return await User.findOne({ where: where });
};

const updateUserByParam = async (param, data) => {
  const user = await User.findOne({ where: { ...param } });
  if (!user) throw new AppError("User not found.", 400);
  Object.keys(data).forEach((key) => {
    user[key] = data[key];
  });
  await user.save();
  return user.toJSON();
};

const createUser = async (data) => {
  if (!data.roleId) data.roleId = 1;
  if (!data.is_active) data.is_active = false;
  return await User.create({ ...data });
};

module.exports = {
  getUsers,
  getUserByParams,
  getUserByParamsAuth,
  createUser,
  updateUserByParam,
};
