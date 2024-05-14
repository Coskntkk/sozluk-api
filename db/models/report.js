const postgres = require("../postgres");

const Report = postgres.define(
  "report",
  {},
  {
    timestamps: true,
  },
);

module.exports = Report;
