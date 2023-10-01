const cognitoIdentityServiceProvider = require('./CognitoIdentityServiceProvider');
const jwt_decode = require('jwt-decode');
const logger = require('../../../logger/logger');
const { getName } = require('../../../logger/logFunctionName');
const moment = require('moment');


exports.login = async (params, next, callback) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        await cognitoIdentityServiceProvider.initiateAuth(params, (err, data) => {
            if (err) {
                logger.error("*** Error in login of %s ***", getName().fileName);
                logger.error(err.message || JSON.stringify(err));
                next({ status: err.statusCode, "success": false, "message": err.message || JSON.stringify(err) });
            } else {
                if (data.ChallengeName == 'NEW_PASSWORD_REQUIRED') {
                    logger.info("*** Ending login of %s ***", getName().fileName);
                    callback({
                        "success": true, "data": {
                            "challengeName": data.ChallengeName,
                            "session": data.Session,
                            "username": data.ChallengeParameters.USER_ID_FOR_SRP
                        }
                    });
                } else {
                    let response = {
                        "success": true, "data": {
                            "idToken": data.AuthenticationResult.IdToken,
                            "challengeName": data.ChallengeParameters,
                            "tokenType": data.AuthenticationResult.TokenType,
                            "accessToken": data.AuthenticationResult.AccessToken,
                            "expiresIn": data.AuthenticationResult.ExpiresIn,
                            "refreshToken": data.AuthenticationResult.RefreshToken
                        }
                    };
                    logger.info("*** Ending login of %s ***", getName().fileName);
                    callback(response);
                }
            }
        })
    } catch (e) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(e.message || JSON.stringify(e));
        next({ success: false, message: e.message || JSON.stringify(e) });
    }
}

exports.currentuserDetailOfCognito = async (req, res, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        //console.log(req.headers.authorization)
        if (req.headers.authorization) {
            let userData = req.headers.authorization.split(' ')[1];
            let decodedUserData = jwt_decode(userData);
            //console.log(JSON.stringify(decodedUserData))
            req.currentUser = decodedUserData;
        } else {
            req.currentUser = null;
        }
        logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
        next();
    } catch (e) {
        req.currentUser = null;
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(e.message || JSON.stringify(e));
        next();
    }
}

exports.forceChangePassword = async (params, next, callback) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        await cognitoIdentityServiceProvider.respondToAuthChallenge(params, (err, data) => {
            if (err) {
                logger.error("*** Error in forceChangePassword of %s ***", getName().fileName);
                logger.error(err.message || JSON.stringify(err));
                next({ status: err.statusCode, success: false, message: err.message || JSON.stringify(err) });
            } else {
                let response = {
                    "idToken": data.AuthenticationResult.IdToken,
                    "challengeName": data.ChallengeParameters,
                    "tokenType": data.AuthenticationResult.TokenType,
                    "accessToken": data.AuthenticationResult.AccessToken,
                    "expiresIn": data.AuthenticationResult.ExpiresIn,
                    "refreshToken": data.AuthenticationResult.RefreshToken
                };
                logger.info("*** Ending forceChangePassword of %s ***", getName().fileName);
                callback({ "success": true, "message": "Password Changed Successfully", "data": response });
            }
        })
    } catch (e) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(e.message || JSON.stringify(e));
        next({ success: false, message: e.message || JSON.stringify(e) });
    }
}

exports.signOut = async (params, next, callback) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        await cognitoIdentityServiceProvider.globalSignOut(params, async (err, data) => {
            if (err) {
                logger.error("*** Error in signOut of %s ***", getName().fileName);
                logger.error(err.message || JSON.stringify(err));
                next({ status: err.statusCode, "success": false, "message": err.message || JSON.stringify(err) });
            }
            else {
                logger.info("*** Ending signOut of %s ***", getName().fileName);
                callback({ "success": true, "message": "Logout_Successfully" });
            }
        });
    } catch (e) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(e.message || JSON.stringify(e));
        next({ success: false, message: e.message || JSON.stringify(e) });
    }
}

exports.userChangePassword = async (params, next, callback) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        await cognitoIdentityServiceProvider.changePassword(params, (err, data) => {
            if (err) {
                logger.error("*** Error in userChangePassword of %s ***", getName().fileName);
                logger.error(err.message || JSON.stringify(err));
                next({ status: err.statusCode, "success": false, "message": err.message || JSON.stringify(err) });
            }
            else {
                logger.info("*** Ending userChangePassword of %s ***", getName().fileName);
                callback({ "success": true, "message": "Password Changed Successfully" });  // successful response
            }
        });
    } catch (e) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(e.message || JSON.stringify(e));
        next({ success: false, message: e.message || JSON.stringify(e) });
    }
}

exports.forgotPassword = async (params, next, callback) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        await cognitoIdentityServiceProvider.forgotPassword(params, (err, data) => {
            if (err) {
                logger.error("*** Error in forgotPassword of %s ***", getName().fileName);
                logger.error(err.message || JSON.stringify(err));
                next({ status: err.statusCode, "success": false, "message": err.message });
            }
            else {
                logger.info("*** Ending forgotPassword of %s ***", getName().fileName);
                callback({ "success": true, "message": "Confirmation Mail Has Been Sent" });  // successful response
            }
        });
    } catch (e) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(e.message || JSON.stringify(e));
        next({ success: false, message: e.message || JSON.stringify(e) });
    }
}

exports.confirmForgotPassword = async (params, next, callback) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        await cognitoIdentityServiceProvider.confirmForgotPassword(params, (err, data) => {
            if (err) {
                logger.error("*** Error in confirmForgotPassword of %s ***", getName().fileName);
                logger.error(err.message || JSON.stringify(err));
                next({ status: err.statusCode, "success": false, "message": err.message || JSON.stringify(err) });
            }
            else {
                logger.info("*** Ending confirmForgotPassword of %s ***", getName().fileName);
                callback({ "success": true, "message": "Password Changed Successfully" });  // successful response
            }
        });
    } catch (e) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(e.message || JSON.stringify(e));
        next({ success: false, message: e.message || JSON.stringify(e) });
    }
}

exports.refreshToken = (params, next, callback) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        cognitoIdentityServiceProvider.initiateAuth(params, (err, data) => {
            if (err) {
                logger.error("*** Error in refreshToken of %s ***", getName().fileName);
                logger.error(err.message || JSON.stringify(err));
                next({ status: err.statusCode, "success": false, "message": err.message || JSON.stringify(err) });
            } // an error occurred
            else {
                let response = {
                    "success": true, "data": {
                        "idToken": data.AuthenticationResult.IdToken,
                        "challengeName": data.ChallengeParameters,
                        "tokenType": data.AuthenticationResult.TokenType,
                        "accessToken": data.AuthenticationResult.AccessToken,
                        "expiresIn": data.AuthenticationResult.ExpiresIn
                    }
                };
                logger.info("*** Ending refreshToken of %s ***", getName().fileName);
                callback(response);
            }
        })
    } catch (e) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(e.message || JSON.stringify(e));
        next({ success: false, message: e.message || JSON.stringify(e) });
    }
}

/*exports.cognitoUserCreate = async (params, next, callback) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        cognitoIdentityServiceProvider.adminCreateUser(params, async (err, data) => {
            if (err) {
                logger.error("*** Error in cognitoUserCreate of %s ***", getName().fileName);
                logger.error(err.message || JSON.stringify(err));
                await next({ status: err.statusCode, "success": false, "message": err.message || JSON.stringify(err) });
            } // an error occurred
            else {
                logger.info("*** Ending cognitoUserCreate of %s ***", getName().fileName);
                await callback({ "success": true, "message": "User created successfully." });
            }
        })
    } catch (e) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(e.message || JSON.stringify(e));
        next({ success: false, message: e.message || JSON.stringify(e) });
    }
}*/

exports.cognitoUserCreate = (params) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    return new Promise((resolve, reject) => {
        cognitoIdentityServiceProvider.adminCreateUser(params, function (err, data) {
            if (err) {
                logger.error("*** Error in cognitoUserCreate of %s ***", getName().fileName);
                logger.error(err.message || JSON.stringify(err));
                reject({ "success": false, "message": err.message || JSON.stringify(err) });
            } // an error occurred
            else {
                logger.info("*** Ending cognitoUserCreate of %s ***", getName().fileName);
                resolve({ "success": true, "message": "User created successfully." });
            }
        })
    })
}

exports.cognitoAdminUpdateUserAttributes = (params) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    return new Promise((resolve, reject) => {
        cognitoIdentityServiceProvider.adminUpdateUserAttributes(params, function (err, data) {
            if (err) {
                logger.error("*** Error in cognitoAdminUpdateUserAttributes of %s ***", getName().fileName);
                logger.error(err.message || JSON.stringify(err));
                reject({ "success": false, "message": err.message || JSON.stringify(err) });
            } // an error occurred
            else {
                logger.info("*** Ending cognitoAdminUpdateUserAttributes of %s ***", getName().fileName);
                resolve({ "success": true, "message": "User attribute updated successfully." });
            }
        })
    })
}

exports.adminDeleteUser = async (params, next, callback) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    await cognitoIdentityServiceProvider.adminDeleteUser(params, (err, data) => {
        if (err) {
            logger.error("*** Error in adminDeleteUser of %s ***", getName().fileName);
            logger.error(err.message || JSON.stringify(err));
            next({ status: err.statusCode, success: false, message: err.message || JSON.stringify(err) });
        }
        else {
            logger.info("*** User deleted successfully in adminDeleteUser of %s ***", getName().fileName);
            logger.info("*** Ending adminDeleteUser of %s ***", getName().fileName);
            callback({ success: true, message: "User_Deleted_Successfully" });
        }
    });
}

exports.adminDisableUser = async (params, next, callback) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    cognitoIdentityServiceProvider.adminDisableUser(params, async (err, data) => {
        if (err) {
            logger.error("*** Error in adminDisableUser of cognitoAuthenticationSystem ***");
            logger.error(err.message || JSON.stringify(err));
            next({ status: err.statusCode, "success": false, "message": err.message || JSON.stringify(err) });
        }
        else {
            logger.info("*** user disabled in cognito in adminDisableUser of cognitoAuthenticationSystem.js ***");
            logger.info("*** Ending adminDisableUser of cognitoAuthenticationSystem.js ***");
            callback({ "success": true, "message": "USER_DISABLE_COGNITO" });
        }
    });
}

exports.adminEnableUser = async (params, next, callback) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    cognitoIdentityServiceProvider.adminEnableUser(params, async (err, data) => {
        if (err) {
            logger.error("*** Error in adminEnableUser of cognitoAuthenticationSystem ***");
            logger.error(err.message || JSON.stringify(err));
            next({ status: err.statusCode, success: false, message: err.message || JSON.stringify(err) });
        }
        else {
            logger.info("*** user enabled in cognitoo in adminDisableUser of cognitoAuthenticationSystem.js ***");
            logger.info("*** Ending adminDisableUser of cognitoAuthenticationSystem.js ***");
            callback({ "success": true, "message": "USER_ENABLE_IN_COGNITO" });
        }
    });
}

exports.adminGetUser = (params) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    return new Promise((resolve, reject) => {
        cognitoIdentityServiceProvider.adminGetUser(params, async (err, data) => {
            if (err) {
                logger.error("*** Error in adminGetUser of cognitoAuthenticationSystem ***");
                logger.error(err.message || JSON.stringify(err));
                resolve({ "success": false, "message": err.message || JSON.stringify(err) });
            }
            else {
                logger.info("*** get user details in adminGetUser of cognitoAuthenticationSystem.js ***");
                logger.info("*** Ending adminGetUser of cognitoAuthenticationSystem.js ***");
                resolve({ "success": true, "data": data });
            }
        });
    })
}
