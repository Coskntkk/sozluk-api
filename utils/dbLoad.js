const { Role, Permission, Model } = require("../db/models");
const scopes = require("./scopes.json");

const loadPermissions = async () => {
  let permissions = Object.keys(scopes);
  for (let i = 0; i < permissions.length; i++) {
    const permission = permissions[i];
    const existing = await Permission.findOne({ where: { name: permission } });
    if (!existing) {
      let obj = {
        id: i + 1,
        name: permission,
      };
      await Permission.create(obj);
    }
  }
  console.log("load roles done");
};

const loadRoles = async () => {
  let roles = ["newbie", "user", "moderator", "admin", "superadmin"];
  for (let i = 0; i < roles.length; i++) {
    const rol = roles[i];
    const existing = await Role.findOne({ where: { name: rol } });
    if (!existing) {
      let obj = {
        id: i + 1,
        name: rol,
        permissions: [],
      };
      await Role.create(obj);
    }
  }
  console.log("load roles done");
};

const loadModels = async () => {
  let models = ["User", "Title", "Entry"];
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const existing = await Model.findOne({ where: { name: model } });
    if (!existing) {
      let obj = {
        id: i + 1,
        name: model,
      };
      await Model.create(obj);
    }
  }
  console.log("load models done");
};

const loadDb = async () => {
  await loadPermissions();
  await loadRoles();
  await loadModels();
  console.log("load db done");
};

module.exports = {
  loadDb,
};
