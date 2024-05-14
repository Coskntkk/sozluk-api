const Sequelize = require("sequelize");
const postgres = require("../postgres");

const Role = postgres.define(
  "role",
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    permissions: {
      type: Sequelize.JSONB,
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = Role;
