const Sequelize = require("sequelize");
const postgres = require("../postgres");
const bcrypt = require("bcrypt");

const User = postgres.define(
    "user",
    {
        username: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        image_url: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        refresh_token: {
            type: Sequelize.CHAR(512),
            allowNull: true,
        },
        is_active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    },
    {
        timestamps: true,
    }
);

// Hash password before saving to database
User.beforeCreate(async (user, options) => {
    // Hash password 
    let hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    // Set default values
    user.image_url = "https://www.shareicon.net/data/512x512/2017/01/06/868320_people_512x512.png";
    user.is_active = false;
    user.role_id = 1;

    return user;
});

module.exports = User;
