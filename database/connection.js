const Sequelize = require('sequelize');
const EV = require('../src/environment');
var reconnectOptions = {
    retry_on_reconnect: {
      transactions: true,
    },
    max_retries: 999,
    onRetry: function (count) {
      logger.info("db connection lost, trying to reconnect (" + count + ")");
    }
  };
const sequelize = new Sequelize(
    EV.DBNAME,
    EV.DBUSERNAME,
    EV.DBPASSWORD,
    {
        host: EV.DBHOST,
        port: EV.DBPORT,
        dialect: 'mysql',
        logging: false,
        timezone: '+00:00',
        reconnect: reconnectOptions || true,
        dialectOptions: {
            connectTimeout: 60000
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 120000,
            idle: 120000,
            evict: 120000,
            handleDisconnects: true
        },
        retry: {
            match: [
                Sequelize.ConnectionError,
                Sequelize.ConnectionTimedOutError,
                Sequelize.TimeoutError,
                /Deadlock/i,
                'Lock wait timeout exceeded; try restarting transaction'
            ],
            max: 3, // Maximum rety 3 times
            backoffBase: 1000, // Initial backoff duration in ms. Default: 100,
            backoffExponent: 1.5, // Exponent to increase backoff each try. Default: 1.1
        }
    }

);

module.exports = sequelize;