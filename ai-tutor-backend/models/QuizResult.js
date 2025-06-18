module.exports = (sequelize, DataTypes) => {
  const QuizResult = sequelize.define('QuizResult', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalQuestions: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  return QuizResult;
};
