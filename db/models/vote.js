const postgres = require("../postgres");

const Vote = postgres.define(
  "vote",
  {
    value: {
      type: postgres.Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = Vote;
