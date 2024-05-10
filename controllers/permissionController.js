// Db
const { Permission, User } = require("../db/models");
const AppError = require("../utils/appError");

const getPermissions = async () => {
    return await Permission.findAll({ order: [['id', 'ASC']] });
};

const getPermissionByParams = async (params) => {
    return await Permission.findOne({ where: { ...params } })
};

const createPermission = async (params) => {
    const { name } = params
    return await Permission.create({ name: name })
}

const updatePermissionByParams = async (params, data) => {
    const permission = await Permission.update({ where: { ...params } });
    Object.keys(data).forEach((key) => {
        permission[key] = data[key]
    })
    await permission.save()
    return permission.toJSON()
};

const deletePermissionByParams = async (params) => {
    // Find permission
    const permission = await Permission.findOne({ where: { ...params } });
    if (!permission) throw new AppError("Permission not found", 404);
    // Delete permission
    await permission.destroy();
};

module.exports = {
    getPermissions,
    createPermission,
    getPermissionByParams,
    updatePermissionByParams,
    deletePermissionByParams
}