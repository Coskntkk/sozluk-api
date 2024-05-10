const Sequelize = require("sequelize");
const postgres = require("../postgres");

const Permission = postgres.define(
    "permission",
    {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        }
    });

module.exports = Permission;
