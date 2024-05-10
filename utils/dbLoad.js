const { Role, Permission } = require("../db/models");
const scopes = require("./scopes.json")
const loadPermissions = async () => {
    let permissions = Object.keys(scopes)
    console.log(permissions);
    for (let i = 0; i < permissions.length; i++) {
        const permission = permissions[i];
        const existing = await Permission.findOne({ where: { name: permission } })
        if (!existing) {
            let obj = {
                id: i + 1,
                name: permission
            }
            // await Permission.create(obj)
        }
    }
    console.log("load roles done");
}

const loadRoles = async () => {
    let roles = [
        "newbie",
        "user",
        "superadmin",
        "admin",
        "moderator",
    ]
    for (let i = 0; i < roles.length; i++) {
        const rol = roles[i];
        const existing = await Role.findOne({ where: { name: rol } })
        if (!existing) {
            let obj = {
                id: i + 1,
                name: rol,
                permissions: []
            }
            await Role.create(obj)
        }
    }
    console.log("load roles done");
}

const loadDb = async () => {
    await loadPermissions()
    // await loadRoles()
    console.log("load db done");
}

module.exports = {
    loadDb
}