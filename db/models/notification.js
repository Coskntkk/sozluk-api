const Sequelize = require("sequelize");
const postgres = require("../postgres");

const Notification = postgres.define(
    "notification",
    {
        message: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        link: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        read: {
            type: Sequelize.STRING,
            allowNull: false,
            default: false,
        }
    },
    {
        timestamps: true
    },
);

module.exports = Notification;
