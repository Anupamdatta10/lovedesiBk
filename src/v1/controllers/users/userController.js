const {
    validateUserLogin,
    validateUserSignOutParams,
    validateUserChangePasswordParams,
    validateForcePasswordChangeParams,
    validateForgotPasswordParams,
    validateConfirmForgotPasswordParams,
    validateRefreshTokenParams,
    userIdFromCognitoDetails,
    formatedCurrentUserDetails
} = require("../../helpers/users/userHelper");
const {
    currentUserDetails
} = require("../../models/queryModels/users/user");

const {
    login,
    signOut,
    userChangePassword,
    forceChangePassword,
    forgotPassword,
    confirmForgotPassword,
    refreshToken
} = require('../../../auth/users/cognito/cognitoAuthenticationSystem');
const EV = require('../../../environment');

const logger = require('../../../logger/logger');
const { getName } = require('../../../logger/logFunctionName');  

//Login
exports.loginUser = async (req, res, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        const validParams = validateUserLogin(req, next);
        if (validParams) {
            logger.info("%s validParams got success response true: %s", getName().functionName, JSON.stringify(validParams));
            let params = {
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: EV.POOLCLIENTID,
                AuthParameters: {
                    'USERNAME': validParams.data.username.trim(),
                    'PASSWORD': validParams.data.password
                }
            };
            await login(params, next, (response) => {
                if (response.success) {
                    logger.info("*** Ending %s of loginUser %s ***", getName().functionName, getName().fileName);
                    res.json({ "success": true, "data": response.data });
                }
            });
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ message: "Internal Server Error" });
    }
}

//Logout
exports.globalSignOut = async (req, res, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        // Check in the parameters send by user is all valid
        const validParams = validateUserSignOutParams(req, next);
        if (validParams) {
            logger.info("%s validParams got success response true: %s", getName().functionName, JSON.stringify(validParams));
            var params = {
                AccessToken: validParams.data.accesstoken,
            };
            await signOut(params, next, (response) => {
                if (response.success) {
                    logger.info("*** Ending %s of globalSignOut %s ***", getName().functionName, getName().fileName);
                    res.send({ "success": true, "message": response.message });
                }
            })
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ message: "Internal Server Error" });
    }
}

//user ChangePassword 
exports.userChangePassword = async (req, res, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        // Check in the parameters send by user is all valid
        const validParams = validateUserChangePasswordParams(req, next);
        if (validParams) {
            logger.info("%s validParams got success response true: %s", getName().functionName, JSON.stringify(validParams));
            var params = {
                AccessToken: validParams.data.accesstoken,
                PreviousPassword: validParams.data.pre_password,
                ProposedPassword: validParams.data.new_password
            };
            await userChangePassword(params, next, (response) => {
                if (response.success) {
                    logger.info("*** Ending %s of userChangePassword %s ***", getName().functionName, getName().fileName);
                    next({ "success": true, "message": response.message });
                }
            });
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ message: "Internal Server Error" });
    }
}

//user force change password
exports.userForcePasswordChange = async (req, res, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        // Check in the parameters send by user is all valid
        const validParams = validateForcePasswordChangeParams(req, next);
        if (validParams) {
            logger.info("%s validParams got success response true: %s", getName().functionName, JSON.stringify(validParams));
            var params = {
                ChallengeName: validParams.data.challengeName,
                ClientId: EV.POOLCLIENTID,
                ChallengeResponses: {
                    USERNAME: validParams.data.username,
                    NEW_PASSWORD: validParams.data.password
                },
                Session: validParams.data.session
            };
            await forceChangePassword(params, next, (response) => {
                if (response.success) {
                    logger.info("*** Ending %s of userForcePasswordChange %s ***", getName().functionName, getName().fileName);
                    res.send({ "success": true, "message": response.message, "data": response.data });
                }
            })
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ message: "Internal Server Error" });
    }
}

//forgot password
exports.forgotPassword = async (req, res, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        const validParams = validateForgotPasswordParams(req, next);
        if (validParams) {
            logger.info("%s validParams got success response true: %s", getName().functionName, JSON.stringify(validParams));
            var params = {
                ClientId: EV.POOLCLIENTID,
                Username: validParams.data.username /* required */
            };
            await forgotPassword(params, next, (response) => {
                if (response.success) {
                    logger.info("*** Ending %s of forgotPassword %s ***", getName().functionName, getName().fileName);
                    res.send({ "success": true, "message": response.message });
                }
            });
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ message: "Internal Server Error" });
    }
}

//confirm forgot password
exports.confirmForgotPassword = async (req, res, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    // Recived parm        
    try {
        const validParams = validateConfirmForgotPasswordParams(req, next);
        if (validParams) {
            logger.info("%s validParams got success response true: %s", getName().functionName, JSON.stringify(validParams));
            var params = {
                ClientId: EV.POOLCLIENTID, /* required */
                ConfirmationCode: validParams.data.confirmmation_code, /* required */
                Password: validParams.data.password, /* required */
                Username: validParams.data.email, /* required */
            }
            await confirmForgotPassword(params, next, (response) => {
                if (response.success) {
                    logger.info("*** Ending %s of confirmForgotPassword %s ***", getName().functionName, getName().fileName);
                    next({ "success": true, "message": response.message });
                }
            })
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ message: "Internal Server Error" });
    }
}

// refreshToken of user
exports.refreshToken = async (req, res, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        const validParams = validateRefreshTokenParams(req, next);
        if (validParams) {
            logger.info("%s validParams got success response true: %s", getName().functionName, JSON.stringify(validParams));
            var params = {
                AuthFlow: 'REFRESH_TOKEN_AUTH',
                ClientId: EV.POOLCLIENTID,
                AuthParameters: {
                    'REFRESH_TOKEN': validParams.data.refreshToken
                }
            }
            await refreshToken(params, next, (response) => {
                if (response.success) {
                    logger.info("*** Ending %s of refreshToken %s ***", getName().functionName, getName().fileName);
                    res.json({ "success": true, "data": response.data });
                }
            });
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ message: "Internal Server Error" });
    }
}

// get current users detail
exports.currentuser = async (req, res, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        const currentCognitoUserDetails = req.currentUser;
        let userParams = JSON.parse(currentCognitoUserDetails['custom:user_details']);
        let current_user_type = userParams.user_type;
        const validParams = await userIdFromCognitoDetails(req, next);
        if (validParams) {
            logger.info("%s validParams got success response true: %s", getName().functionName, JSON.stringify(validParams));
            const current_user_id = validParams;
            const userDetails = await currentUserDetails(current_user_id, current_user_type, next);
            if (userDetails) {
                logger.info("%s userDetails got success response true: %s", getName().functionName, JSON.stringify(validParams));
                const formatedUserDetails = await formatedCurrentUserDetails(userDetails.data, next);
                if (formatedUserDetails.success) {
                    logger.info("*** Ending %s of %s currentuser ***", getName().functionName, getName().fileName);
                    res.json({ "success": true, "data": formatedUserDetails.data });
                }
            }
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ message: "Internal Server Error" });
    }
}