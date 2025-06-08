const Sequelize = require("sequelize");
const postgres = require("../postgres");

const ErrorLog = postgres.define(
  "error_log",
  {
    error_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    stack: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    statusCode: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = ErrorLog;
