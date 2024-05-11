const { Op } = require('sequelize')

const acclevel = (user) => {
    // Own admin meselesi
    const opt = [];
    const { id } = user;
    if (!id) return opt;
    if (id && id > 0) opt.push({ user_id: id });
    return opt;
}

const acclevelOwner = (own, user) => {
    const { id } = user;
    let opt = [];
    if (!id || !own) return opt;
    if (own && id && id > 0) opt.push({ user_id: id });
    return opt;
}

const createAndWhere = (opt) => {
    return opt.length > 1
        ? {
            [Op.and]: [...opt],
        }
        : opt[0]
}

const createOrWhere = (opt) => {
    return opt.length > 1
        ? {
            [Op.or]: [...opt],
        }
        : opt[0]
}

module.exports = {
    acclevel,
    acclevelOwner,
    createAndWhere,
    createOrWhere
}
