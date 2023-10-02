const Sequelize = require("sequelize");
const sequelize = require("../../../database/connection");
module.exports = sequelize.define(
  "Cupon",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    name: {
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
    cupon_code: {
      allowNull: false,
      type: Sequelize.STRING
    },
    price: {
      allowNull: false,
      type: Sequelize.STRING
    },
    price_type: {
      allowNull: false,
      type: Sequelize.STRING
    },
    start_date: {
      allowNull: false,
      type: Sequelize.STRING
    },
    end_date: {
      allowNull: false,
      type: Sequelize.STRING
    },
    min_price: {
      allowNull: false,
      type: Sequelize.STRING
    },
    max_price_allowed: {
      allowNull: false,
      type: Sequelize.STRING
    }
  },
  {
    tableName: "cupons",
  }
);