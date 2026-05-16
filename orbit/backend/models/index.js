const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false
});

const User = require('./User')(sequelize, DataTypes);
const Project = require('./Project')(sequelize, DataTypes);
const ProjectMember = require('./ProjectMember')(sequelize, DataTypes);
const Task = require('./Task')(sequelize, DataTypes);
const ActivityLog = require('./ActivityLog')(sequelize, DataTypes);
const ResetToken = require('./ResetToken')(sequelize, DataTypes);

// Relations
User.hasMany(Task, { foreignKey: 'assignedTo', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

Project.hasMany(Task, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'projectId', as: 'members' });
User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'userId', as: 'projects' });

Project.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(Project, { foreignKey: 'createdBy' });

User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activities' });
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(ResetToken, { foreignKey: 'userId', as: 'resetTokens', onDelete: 'CASCADE' });
ResetToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Project,
  ProjectMember,
  Task,
  ActivityLog,
  ResetToken
};
