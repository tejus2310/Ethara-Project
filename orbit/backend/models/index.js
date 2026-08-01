const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

require('dotenv').config();

let sequelize;
if (process.env.DB_URL && process.env.DB_URL.startsWith('postgres')) {
  sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    // Each warm serverless container holds its own pool, so a generous per-pool
    // max multiplies across containers and exhausts the database's connection
    // limit under load. Keep it small and drop idle handles quickly.
    pool: {
      max: process.env.VERCEL ? 2 : 10,
      min: 0,
      idle: 10000,
      acquire: 30000
    },
    logging: false
  });
} else if (process.env.VERCEL) {
  // The SQLite fallback below needs the sqlite3 native module, which is not
  // installed for deployment, and its filesystem would be wiped on every cold
  // start anyway. Fail with the actual cause rather than a missing-dialect error.
  throw new Error(
    'DB_URL must be set to a postgres:// connection string on Vercel. ' +
    'Add it under Project Settings → Environment Variables.'
  );
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false
  });
}

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
