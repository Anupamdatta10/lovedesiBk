const Sequelize = require("sequelize");
const sequelize = require("../../../database/connection");
module.exports = sequelize.define(
  "Catagory",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    name : {
        allowNull: false,
        type: Sequelize.STRING
    },
    status: {
        allowNull: false,
        type: Sequelize.STRING
    },
    description: {
        allowNull: false,
        type: Sequelize.STRING
    },
    image_url: {
        type: Sequelize.TEXT
    }
    },
  {
    tableName: "catagory",
  }
);