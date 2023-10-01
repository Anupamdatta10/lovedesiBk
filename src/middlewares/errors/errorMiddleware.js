const logger = require("../../logger/logger");
const { getName } = require('../../logger/logFunctionName');
const { SERVER_ERR } = require("./errors");

exports.errorHandler = async (err, req, res, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        const status = err.status || 500;
        const message = err.message || SERVER_ERR;
        logger.error('Error occour due to %s in %s of %s', message, getName().functionName, getName().fileName);
        res.status(status).json({
            success: false,
            message
        })
    } catch (err) {
        logger.error('Error occour due to %s', err.message || JSON.stringify(err));
        res.status(500).json({
            success: false,
            message: err.message || JSON.stringify(err)
        })
    }
}