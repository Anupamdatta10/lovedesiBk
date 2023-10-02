const Sequelize = require("sequelize");
const sequelize = require("../../../database/connection");
module.exports = sequelize.define(
    "BookingDetails",
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
        store_id: {
            allowNull: false,
            type: Sequelize.STRING
        },
        booking_date: {
            allowNull: true,
            type: Sequelize.STRING
        },
        head_count: {
            allowNull: true,
            type: Sequelize.STRING
        },
        coupon_id: {
            allowNull: true,
            type: Sequelize.STRING
        },
        status: {
            allowNull: false,
            type: Sequelize.STRING
        },
    },
    {
        tableName: "bookings",
    }
);