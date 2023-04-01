const Sequelize = require("sequelize");
const postgres = require("../postgres");

const Entry = postgres.define(
    "entry",
    {
        message: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    },
    {
        timestamps: true,
    }
);


module.exports = Entry;
