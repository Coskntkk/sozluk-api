// Db
const { Role, User } = require("../db/models");
const AppError = require("../utils/appError");

const getRoles = async () => {
  return await Role.findAll({ order: [["id", "ASC"]] });
};

const getRoleByParams = async (params) => {
  return await Role.findOne({ where: { ...params } });
};

const createRole = async (params) => {
  const { name } = params;
  return await Role.create({
    name: name,
    permissions: [],
  });
};

const updateRoleByParams = async (params, data) => {
  const role = await Role.findOne({ where: { ...params } });
  Object.keys(data).forEach((key) => {
    role[key] = data[key];
  });
  await role.save();
  return role.toJSON();
};

const deleteRoleByParams = async (params) => {
  // Find role
  const role = await Role.findOne({ where: { ...params } });
  if (!role) throw new AppError("Role not found", 404);
  // Check if there are users with this role
  const userCount = await User.count({ where: { roleId: params.id } });
  if (userCount && userCount > 0)
    throw new AppError("There are users with this role.");
  // Delete role
  await role.destroy();
};

module.exports = {
  getRoles,
  createRole,
  getRoleByParams,
  updateRoleByParams,
  deleteRoleByParams,
};
