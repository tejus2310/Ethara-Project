module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Project', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    deadline: { type: DataTypes.DATE }
  });
};
