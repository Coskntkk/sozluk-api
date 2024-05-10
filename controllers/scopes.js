const { Op } = require('sequelize')

const acclevel = (req) => {
    const { user, own } = req
    // Own admin meselesi
    const opt = []
    const { id } = user
    if (!id) return opt
    if (id && id > 0) opt.push({ user_id: user.id })
    return opt
}

const acclevelOwner = (user) => {
    const opt = []
    const { id } = user
    if (!id) return opt
    if (id && id > 0) opt.push({ user_id })
    return opt
}

const createAndWhere = (opt) => {
    return opt.length > 1
        ? {
            [Op.and]: [...opt],
        }
        : opt[0]
}

module.exports = {
    acclevel,
    acclevelOwner,
    createAndWhere,
}
