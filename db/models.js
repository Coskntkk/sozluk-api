
const User = require("./models/user");
const Role = require("./models/role");
const Title = require("./models/title");
const Entry = require("./models/entry");
const Vote = require("./models/vote");
const ActionLog = require("./models/action_log");
const ErrorLog = require("./models/error_log");

// Relationships
// User - Role
User.belongsTo(Role, { foreignKey: "role_id" });
Role.hasMany(User, { foreignKey: "role_id" });

// Entry - User
Entry.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Entry, { foreignKey: "user_id" });

// Entry - Title
Entry.belongsTo(Title, { foreignKey: "title_id" });
Title.hasMany(Entry, { foreignKey: "title_id" });

// ActionLog - User
ActionLog.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(ActionLog, { foreignKey: "user_id" });

// Vote - Entry
Vote.belongsTo(Entry, { foreignKey: "entry_id" });
Entry.hasMany(Vote, { foreignKey: "entry_id" });

// Vote - User
Vote.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Vote, { foreignKey: "user_id" });

module.exports = {
    User,
    Role,
    Title,
    Entry,
    Vote,
    ActionLog,
    ErrorLog,
};
