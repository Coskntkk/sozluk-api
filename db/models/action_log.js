const Sequelize = require("sequelize");
const postgres = require("../postgres");

const ActionLog = postgres.define(
    "action_log",
    {
        action: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    },
    {
        timestamps: true,
    }
);


module.exports = ActionLog;
