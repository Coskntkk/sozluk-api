const db = require("../postgres")
const {
    Permission,
    Role,
    User,
    Model,
    ReportStatus,
} = require("../models")
const models = [
    { id: 1, name: "User" },
    { id: 2, name: "Title" },
    { id: 3, name: "Entry" }
]
const permissions = [
    { id: 1, name: 'user_delete' },
    { id: 2, name: 'title_create' },
    { id: 3, name: 'title_update' },
    { id: 4, name: 'title_delete' },
    { id: 5, name: 'entry_create' },
    { id: 6, name: 'entry_update' },
    { id: 7, name: 'entry_delete' },
    { id: 8, name: 'vote_create' },
    { id: 9, name: 'vote_delete' },
    { id: 10, name: 'role_create' },
    { id: 11, name: 'role_update' },
    { id: 12, name: 'role_delete' },
    { id: 13, name: 'report_create' },
    { id: 14, name: 'report_delete' },
]
const roles = [
    {
        id: 1,
        name: "Newbie",
        permission: [],
    },
    {
        id: 2,
        name: "User",
        permission: [],
    },
    {
        id: 3,
        name: "Moderator",
        permission: [],
    },
    {
        id: 4,
        name: "Admin",
        permission: [],
    }
]
const reportStatuses = [
    { id: 1, name: "Open" },
    { id: 2, name: "Rejected" },
    { id: 3, name: "Accepted" },
]
const users = [
    {
        username: "Cos",
        email: "coskntkk@gmail.com",
        password: "asdasd",
        imageUrl: "https://www.shareicon.net/data/512x512/2017/01/06/868320_people_512x512.png",
        isActive: true,
        roleId: 4,
    },
    {
        username: "Cos2",
        email: "coskntkk2@gmail.com",
        password: "asdasd",
        imageUrl: "https://www.shareicon.net/data/512x512/2017/01/06/868320_people_512x512.png",
        isActive: true,
        roleId: 3,
    },
    {
        username: "Cos3",
        email: "coskntkk3@gmail.com",
        password: "asdasd",
        imageUrl: "https://www.shareicon.net/data/512x512/2017/01/06/868320_people_512x512.png",
        isActive: true,
        roleId: 2,
    },
    {
        username: "Cos4",
        email: "coskntkk4@gmail.com",
        password: "asdasd",
        imageUrl: "https://www.shareicon.net/data/512x512/2017/01/06/868320_people_512x512.png",
        isActive: true,
        roleId: 1,
    }
]
const createDb = async () => {
    try {
        await db.didSync.then(() => db.sync({ force: true }))

        await Model.bulkCreate(models)
        await Permission.bulkCreate(permissions)
        await Role.bulkCreate(roles)
        await ReportStatus.bulkCreate(reportStatuses)
        await User.bulkCreate(users)
    } catch (error) {
        console.log(error)
    } finally {
        await db.close()
    }
}
module.exports = { createDb }
// createDb()