const {
    validateAuth
} = require("../../helpers/common/authenticationHelper");

const logger = require('../../../logger/logger');
const { getName } = require('../../../logger/logFunctionName');  
const jwt_decode = require('jwt-decode');


exports.authenticate = (req, res, next) => {
    try {
        logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
        // check if params are present
        const validatedAuth = validateAuth(req, next);
        if (validatedAuth.success) {
            var token = validatedAuth.data.split(" ")[1];
            if (token && token.trim() != "") {
                var userDetails = jwt_decode(token);
                req.currentUser = userDetails;
                logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
                next();
            } else {
                logger.error(`Invalid token in %s of %s`, getName().functionName, getName().fileName);
                next({ status: 401, message: "Invalid_Authorization_Token" });
                return;
            }
        }
    } catch (err) {
        logger.error(`${err.message || JSON.stringify(err)} in %s of %s`, getName().functionName, getName().fileName);
        next({ message: err.message || JSON.stringify(err) });
        return;
    }
}