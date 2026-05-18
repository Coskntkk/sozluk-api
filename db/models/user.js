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
    },
    email_verify_token: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    password_verify_token: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  },
);

const hashPasswordIfNeeded = async (password) => {
  if (typeof password === "string" && password.startsWith("$2")) {
    return password;
  }
  return bcrypt.hash(password, 10);
};

User.beforeCreate(async (user /*options*/) => {
  user.password = await hashPasswordIfNeeded(user.password);
  user.image_url =
    "https://www.shareicon.net/data/512x512/2017/01/06/868320_people_512x512.png";
  user.is_active = false;
  user.role_id = 1;

  return user;
});

User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    user.password = await hashPasswordIfNeeded(user.password);
  }
});

module.exports = User;
