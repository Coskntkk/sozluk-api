const User = require("./models/user");
const Role = require("./models/role");
const Title = require("./models/title");
const Entry = require("./models/entry");
const Vote = require("./models/vote");
const ActionLog = require("./models/action_log");
const Permission = require("./models/permission");
const Model = require("./models/model");
const ErrorLog = require("./models/error_log");
const Report = require("./models/report");
const ReportStatus = require("./models/repost_status");

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

// Report
User.hasMany(Report, {
  as: "reporter",
  foreignKey: { allowNull: false, name: "reporterId" },
});
User.hasMany(Report, {
  as: "reportee",
  foreignKey: { allowNull: true, name: "reporteeId" },
});
Report.belongsTo(User, {
  as: "reporter",
  foreignKey: { allowNull: false, name: "reporterId" },
});
Report.belongsTo(User, {
  as: "reportee",
  foreignKey: { allowNull: true, name: "reporteeId" },
});

Report.belongsTo(Model, { foreignKey: "model_id" });
Model.hasMany(Report, { foreignKey: "model_id" });

Report.belongsTo(ReportStatus, { foreignKey: "status_id" });
ReportStatus.hasMany(Report, { foreignKey: "status_id" });

module.exports = {
  User,
  Role,
  Permission,
  Title,
  Entry,
  Vote,
  ActionLog,
  ErrorLog,
  Model,
  Report,
  ReportStatus,
};
