const postgres = require("../postgres");

const Vote = postgres.define(
  "vote",
  {
    is_upvote: {
      type: postgres.Sequelize.BOOLEAN,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = Vote;
