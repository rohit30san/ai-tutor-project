module.exports = (sequelize, DataTypes) => {
  const ChatSessionSummary = sequelize.define('ChatSessionSummary', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  });

  return ChatSessionSummary;
};
