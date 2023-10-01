const {
    validateParamsUserCreate,
    validateUsersList,
    formatResponseUsersList,
    validateUserUpdate,
    formatResponseUserUpdate,
    validateUserDelete,
    formatResponseUserDelete,
    validateUsersListById,
    formatResponseUsersListById
} = require("../../helpers/users/adminUserHelper");

const {
    userCreate,
    usersList,
    userListById,
    userUpdate,
    userDelete
} = require("../../models/queryModels/users/adminUser");

const {
    cognitoUserCreate,
    cognitoAdminUpdateUserAttributes
} = require('../../../auth/users/cognito/cognitoAuthenticationSystem');

const { createTempPass } = require('../../../common_modules/create_temp_pass');
let AWS = require('aws-sdk');
const EV = require('../../../environment');
const logger = require('../../../logger/logger');
const { getName } = require('../../../logger/logFunctionName');  


exports.createUser = async (req, res, next) => {
    let language = req.headers.language || 'en';
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        const currentCognitoUserDetails = req.currentUser;
        // if (!currentCognitoUserDetails) {
        //     next({ status: false, message: "UNAUTHORIZED", language });
        // }
        let userParams = JSON.parse(currentCognitoUserDetails['custom:user_details']);
        let currentUserId = userParams.user_id;
        // Create multiple users
        let usersDataArr = req.body;
        let isArray = Array.isArray(usersDataArr);
        if (isArray) {
            if (usersDataArr.length > 0) {
                let responseArr = [];
                usersDataArr.forEach(async userData => {
                    var validParams = await validateParamsUserCreate(userData);
                    if (validParams.success) {
                        logger.info("%s Valid params got success response true: %s", getName().functionName, JSON.stringify(validParams));
                        // create user 
                        userCreate(validParams, currentUserId)
                            .then(userData => {
                                if (userData.success) {
                                    let user_details = validParams.data;
                                    let DELIVERY_BY = 'EMAIL';
                                    if (user_details) {
                                        let userId = userData.data.id;
                                        let extraPram = {
                                            "user_id": userId
                                        }
                                        let tempPass = createTempPass(8);
                                        let UserAttributes = [];
                                        let user_name = user_details.email;
                                        if (user_details.email) {
                                            UserAttributes = [
                                                {
                                                    Name: 'email',
                                                    Value: user_details.email
                                                },
                                                {
                                                    Name: "email_verified",
                                                    Value: "true"
                                                },
                                            ];
                                        }
                                        else {
                                            DELIVERY_BY = 'SMS'
                                            user_name = user_details.contact_number;
                                        }
                                        //if(validatePhone(user_details.contact_number)){
                                        UserAttributes.push({
                                            Name: "phone_number",
                                            Value: user_details.contact_number
                                        })
                                        UserAttributes.push({
                                            Name: "phone_number_verified",
                                            Value: "true"
                                        });
                                        //}
                                        UserAttributes.push({
                                            Name: 'custom:user_details',
                                            Value: JSON.stringify(extraPram)
                                        });
                                        UserAttributes.push({
                                            Name: "name",
                                            Value: `${user_details.first_name} ${user_details.last_name}`
                                        });
                                        let params = {
                                            UserPoolId: EV.AWS_POOL_ID,
                                            Username: user_name,
                                            DesiredDeliveryMediums: [DELIVERY_BY],
                                            TemporaryPassword: tempPass,
                                            UserAttributes: UserAttributes
                                        };

                                        cognitoUserCreate(params)
                                            .then(async (responseParam) => {
                                                if (responseParam.success) {
                                                    let userArr = [];
                                                    var data = userData.data;
                                                    var dataKeys = Object.keys(data)
                                                    let userHsh = {};
                                                    dataKeys.forEach(element => {
                                                        userHsh[element] = data[element]
                                                    })
                                                    userArr.push(userHsh)

                                                    logger.info("*** Ending %s of adminCreateUser %s ***", getName().functionName, getName().fileName);
                                                    let hash_for_notification = { "data": { "user_id": userId, "type": "email", "tempPass": tempPass, "purpose": "user_create" } };
                                                    if (!user_details.email) {
                                                        hash_for_notification = { "data": { "user_id": userId, "type": "sms", "tempPass": tempPass, "purpose": "user_create" } };
                                                    }
                                                    //await notificationJobCreate(hash_for_notification, currentUserId);

                                                    responseArr.push({ "status": 200, "success": true, "message": `${responseParam.message} Username and password send to user ${!user_details.email ? 'phone number' : 'email'}`, "data": userArr });
                                                    if (usersDataArr.length == responseArr.length) {
                                                        res.send(responseArr);
                                                    }
                                                } else {
                                                    logger.error("Got success false while accessing adminCreateUser method in %s ", getName().functionName);
                                                    responseArr.push({ "success": false, "message": responseParam.message });
                                                    if (usersDataArr.length == responseArr.length) {
                                                        next(responseArr, req);
                                                    }
                                                }
                                            })
                                            .catch(err => {
                                                logger.error("*** Error while accessing adminCreateUser method in %s of %s ***", getName().functionName, getName().fileName);
                                                logger.error(err.message || JSON.stringify(err));
                                                responseArr.push({ "success": false, "message": err.message || JSON.stringify(err) });
                                                if (usersDataArr.length == responseArr.length) {
                                                    next(responseArr, req);
                                                }
                                            })
                                    } else {
                                        responseArr.push({ "status": 200, "success": true, "message": userData.message });
                                        if (usersDataArr.length == responseArr.length) {
                                            res.send(responseArr, req);
                                        }
                                    }
                                } else {
                                    logger.error(`${userData.message} in adminCreateUser %s of %s `, getName().functionName, getName().fileName);
                                    responseArr.push({ "status": 200, "success": false, "message": userData.message });
                                    if (usersDataArr.length == responseArr.length) {
                                        res.status(200).send(responseArr);
                                    }
                                }
                            })
                    } else {
                        logger.error("Valid params got success response false %s ", getName().functionName);
                        responseArr.push({ "success": false, "message": validParams.message });
                        if (usersDataArr.length == responseArr.length) {
                            next(responseArr, req);
                        }
                    }
                })
            } else {
                logger.error("No data found in %s of %s", getName().functionName, getName().fileName);
                // res.status(400).json({ "success": false, "message": "No data found" });
                next({ "status": 400, "success": false, "message": "NO_DATA_FOUND", language })
            }

        } else {
            logger.error("Data format is not correct in %s of %s", getName().functionName, getName().fileName);
            // res.status(400).json({ "success": false, "message": "Data format is not correct" });
            next({ "status": 400, "success": false, "message": "DATA_FORMAT_IS_NOT_CORRECT", language })
        }
    } catch (error) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(error.message || JSON.stringify(error));
        //res.status(400).json(error.message || JSON.stringify(error));
        next({ "status": 500, "success": false, "message": "Internal Server Error", language })
    }
}

exports.listUser = async (req, res, next) => {
    try {
        logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
        // check if params are present
        const validDatas = await validateUsersList(req, next);
        logger.info("%s validparams got success response true: %s", getName().functionName, JSON.stringify(validDatas));
        if (validDatas) {
            let userData = await usersList(validDatas, next);
            if (userData) {
                let responseData = await formatResponseUsersList(userData);
                if (responseData.success) {
                    var response = {
                        "success": responseData.success,
                        "message": responseData.message,
                        "total": responseData.total,
                        "data": responseData.data
                    }
                    logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
                    res.json(response);
                }
            }
        }
    } catch (err) {
        logger.error(`${err.message || JSON.stringify(err)} in %s of %s`, getName().functionName, getName().fileName);
        next({ message: "Internal Server Error" });
        return;
    }
}




exports.listUserById = async (req, res, next) => {
    try {
        logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
        // check if params are present
        const validDatas = await validateUsersListById(req, next);
        logger.info("%s validparams got success response true: %s", getName().functionName, JSON.stringify(validDatas));
        if (validDatas) {
            let userData = await userListById(validDatas, next);
            if (userData) {
                let responseData = await formatResponseUsersListById(userData);
                if (responseData.success) {
                    var response = {
                        "success": responseData.success,
                        "message": responseData.message,
                        "total": responseData.total,
                        "data": responseData.data
                    }
                    logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
                    res.json(response);
                }
            }
        }
    } catch (err) {
        logger.error(`${err.message || JSON.stringify(err)} in %s of %s`, getName().functionName, getName().fileName);
        next({ message: "Internal Server Error" });
        return;
    }
}

exports.updateUser = async (req, res, next) => {
    try {
        logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
        // check if params are present
        const currentCognitoUserDetails = req.currentUser;
        let userParams = JSON.parse(currentCognitoUserDetails['custom:user_details']);
        let currentUserId = userParams.user_id;
        let current_user_type = userParams.user_type;
        let params = {};
        const validDatas = validateUserUpdate(req, next);
        logger.info("%s validparams got success response true: %s", getName().functionName, JSON.stringify(validDatas));
        if (validDatas) {
            let userData = await userUpdate(validDatas, next);
            if (userData) {
                let responseData = formatResponseUserUpdate(userData);
                if (responseData.success) {
                    if (validDatas.data) {
                        let UserAttributes = [];
                        params['UserPoolId'] = EV.AWS_POOL_ID;
                        params['Username'] = responseData.username;
                        if (validDatas.data.email) {
                            UserAttributes.push({ Name: 'email', Value: validDatas.data.email }, { Name: "email_verified", Value: "true" });
                            params['UserAttributes'] = UserAttributes;
                        }
                        if (validDatas.data.contact_number) {
                            UserAttributes.push({ Name: 'phone_number', Value: validDatas.data.contact_number }, { Name: "phone_number_verified", Value: "true" });
                            params['UserAttributes'] = UserAttributes;
                        }
                       let responseParam = await cognitoAdminUpdateUserAttributes(params)
                        // .then(async (responseParam) => {

                        // }).catch(error => {
                        //     logger.error("*** Error while accessing %s method in of %s ***", getName().functionName, getName().fileName);
                        //     logger.error(error.message || JSON.stringify(error));
                        //     res.status(400).json({message: error.message,success: false});
                        //     return;
                        // })
                    }
                    var response = {
                        "success": responseData.success,
                        "message": responseData.message,
                        "data": responseData.data
                    }
                    logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
                    res.send(response);
                }
            }
        }
    } catch (err) {
        logger.error(`${err.message || JSON.stringify(err)} in %s of %s`, getName().functionName, getName().fileName);
        next({ message: err.message });
        return;
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
        // check if params are present
        const currentCognitoUserDetails = req.currentUser;
        let userParams = JSON.parse(currentCognitoUserDetails['custom:user_details']);
        let current_user_type = userParams.user_type;
        const validDatas = validateUserDelete(req, next);
        logger.info("%s validparams got success response true: %s", getName().functionName, JSON.stringify(validDatas));
        if (validDatas) {
            let userData = await userDelete(validDatas, next);
            if (userData) {
                let responseData = formatResponseUserDelete(userData);
                // if (validMiddlewareData.not_acceptable_data.length > 0) {
                //     for (let i = 0; i < validMiddlewareData.not_acceptable_data.length; i++) {
                //         responseData.data.push(validMiddlewareData.not_acceptable_data[i])
                //     }
                // }
                if (responseData.success) {
                    var response = {
                        "success": responseData.success,
                        "message": responseData.message,
                        "data": responseData.data
                    }
                    logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
                    res.send(response);
                }
            }
        }
    } catch (err) {
        logger.error(`${err.message || JSON.stringify(err)} in %s of %s`, getName().functionName, getName().fileName);
        next({ message: "Internal Server Error" });
        return;
    }
}