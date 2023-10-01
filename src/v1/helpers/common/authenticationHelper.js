const logger = require('../../../logger/logger');
const { getName } = require('../../../logger/logFunctionName');


exports.validateAuth = (req, next) => {
    logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
    try {
        let header = req.headers;
        if (!header || Object.keys(header).length == 0) {
            logger.error("Required parameters are missing in  %s of %s", getName().functionName, getName().fileName);
            next({ success: false, status: 400, message: "Required parameters are missing" });
        } else if (!header.authorization || header.authorization.trim() == "") {
            logger.error("Unauthorized in  %s of %s", getName().functionName, getName().fileName);
            next({ success: false, status: 401, message: "Unauthorized" });
        } else {
            return { success: true, data: header.authorization };
        }
    } catch (err) {
        logger.error(`${err.message || JSON.stringify(err)} in  %s of %s`, getName().functionName, getName().fileName);
        next({ success: false, status: 500, message: err.message || JSON.stringify(err) });
    }
}