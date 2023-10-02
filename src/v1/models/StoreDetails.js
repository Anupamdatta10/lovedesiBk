const Sequelize = require("sequelize");
const sequelize = require("../../../database/connection");
module.exports = sequelize.define(
  "StoreDetails",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    catagory_id : {
        allowNull: false,
        type: Sequelize.INTEGER
    },
    address: {
        allowNull: false,
        type: Sequelize.STRING
    },
    img_url: {
        type: Sequelize.TEXT
    },
    lat: {
      allowNull: false,
      type: Sequelize.STRING
    },
    lng: {
      allowNull: false,
      type: Sequelize.STRING
  },
    },
  {
    tableName: "store_details",
  }
);