const Sequelize = require("sequelize");
const postgres = require("../postgres");

const Report = postgres.define(
  "report",
  {
    item_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    note: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = Report;
