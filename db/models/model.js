const Sequelize = require("sequelize");
const postgres = require("../postgres");

const Model = postgres.define(
  "model",
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  },
);

module.exports = Model;
