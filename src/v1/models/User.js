const Sequelize = require("sequelize");
const sequelize = require("../../../database/connection");
module.exports = sequelize.define(
  "User",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    first_name: {
        allowNull: false,
        type: Sequelize.STRING
    },
    last_name: {
        allowNull: false,
        type: Sequelize.STRING
    },
    contact_number: {
        allowNull: false,
        type: Sequelize.STRING
    },
    email: {
        allowNull: false,
        type: Sequelize.STRING
    },
    user_type: {
        allowNull: false,
        type: Sequelize.STRING
    },
    profile_img_url: {
        type: Sequelize.TEXT
    },
    status:{
        allowNull: false,
        type: Sequelize.BOOLEAN
    }
    },
  {
    tableName: "users",
  }
);