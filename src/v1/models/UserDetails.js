const Sequelize = require("sequelize");
const sequelize = require("../../../database/connection");
module.exports = sequelize.define(
    "UserDetails",
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        user_id: {
            allowNull: false,
            type: Sequelize.STRING
        },
        address: {
            allowNull: false,
            type: Sequelize.STRING
        },
        img_url: {
            allowNull: true,
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