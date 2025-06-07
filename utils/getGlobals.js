const { getPermissions } = require("../controllers/permissionController");
const { getRoles } = require("../controllers/roleController");

const getGlobalValues = async () => {
  // Roles
  let rolesData = await getRoles();
  const roles = {};
  rolesData.forEach((rol) => {
    roles[rol.id] = rol.toJSON();
  });
  // Permissions
  let permissionsData = await getPermissions();
  const permissions = {};
  permissionsData.forEach((permission) => {
    permission[permission.id] = permission.toJSON();
  });
  // Return
  return {
    roles,
    permissions,
  };
};

module.exports = { getGlobalValues };
