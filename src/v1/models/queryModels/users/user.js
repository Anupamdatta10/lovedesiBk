const db = require('../../index');
const { Op } = require("sequelize");
const logger = require('../../../../logger/logger');
const { getName } = require('../../../../logger/logFunctionName');



exports.currentUserDetails = async (params, current_user_type, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
       let result = await db.User.findOne({ where: {id: params.data.user_id}});
       return ({ success: true, data: result}); 
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "message": "Internal Server Error", success: false });
    }
}