module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ActivityLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    action: { type: DataTypes.STRING, allowNull: false },
    details: { type: DataTypes.STRING }
  });
};
