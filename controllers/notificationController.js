const { Notification } = require("../db/models")
const AppError = require("../utils/appError")


const createNotification = async (params) => {
    return await Notification.create(params)
}


const getNotificationsByUserId = async (userId, query) => {
    const { page, limit } = query;
    return await Notification.findAndCountAll({
        where: { user_id: userId },
        limit: limit,
        offset: limit * (page - 1),
    });
};


const readNotification = async (id) => {
    const notif = await Notification.findByPk(id)
    if (!notif) throw new AppError('Notification not found.', 404)
    notif.read = true
    await notif.save()
}

module.exports = {
    createNotification,
    getNotificationsByUserId,
    readNotification
}