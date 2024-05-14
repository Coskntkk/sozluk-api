const Sequelize = require("sequelize");
const postgres = require("../postgres");

const ReportStatus = postgres.define(
  "report_status",
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: false,
  },
);

module.exports = ReportStatus;
