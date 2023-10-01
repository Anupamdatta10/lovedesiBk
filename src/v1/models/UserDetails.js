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
        address: {
            allowNull: false,
            type: Sequelize.STRING
        },
        img_url: {
            allowNull: false,
            type: Sequelize.STRING
        },
        status: {
            allowNull: false,
            type: Sequelize.STRING
        },
    },
    {
        tableName: "user_details",
    }
);