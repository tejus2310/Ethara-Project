module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ProjectMember', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
  });
};
