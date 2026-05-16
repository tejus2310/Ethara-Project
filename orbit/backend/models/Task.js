module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Task', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('Todo', 'In Progress', 'Done', 'Overdue'), defaultValue: 'Todo' },
    priority: { type: DataTypes.ENUM('Low', 'Medium', 'High'), defaultValue: 'Medium' },
    dueDate: { type: DataTypes.DATE }
  });
};
