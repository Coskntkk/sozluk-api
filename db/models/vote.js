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
    // indexes: [
    //   {
    //     unique: true,
    //     fields: ['entry_id', 'user_id']
    //   }
    // ]
  },
);

module.exports = Vote;
