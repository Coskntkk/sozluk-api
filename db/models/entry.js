const Sequelize = require("sequelize");
const postgres = require("../postgres");

const Entry = postgres.define(
  "entry",
  {
    message: {
      type: Sequelize.STRING(280),
      allowNull: false,
    },
    point: {
      type: Sequelize.INTEGER,
      allowNull: false,
      default: 0
    },
  },
  {
    timestamps: true,
  },
);

module.exports = Entry;
