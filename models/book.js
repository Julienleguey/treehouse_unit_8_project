'use strict';

module.exports = function(sequelize, DataTypes) {
  const Book = sequelize.define('Book', {
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Title is required!"
        }
      }
    },
    author: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Author is required!"
        }
      }
    },
    genre: DataTypes.STRING,
    year: DataTypes.INTEGER
  });


  return Book;
};
