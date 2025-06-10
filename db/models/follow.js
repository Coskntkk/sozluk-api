// const Sequelize = require("sequelize");
const postgres = require("../postgres");

const Follow = postgres.define(
    "follow",
    {},
    {
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['follower_id', 'following_id']
            }
        ]
    },
);

module.exports = Follow;
