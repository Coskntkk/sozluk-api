const Sequelize = require("sequelize");
const postgres = require("../postgres");
const slugify = require('slugify');

const Title = postgres.define(
    "title",
    {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        slug: {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

// Generate slug from name before creating
Title.beforeCreate((title, options) => {
    title.slug = slugify(title.name, { lower: true });
});

module.exports = Title;
