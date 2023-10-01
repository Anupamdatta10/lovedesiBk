const logger = require('../../../logger/logger');
const { getName } = require('../../../logger/logFunctionName');
const Joi = require('joi');

exports.validateUserLogin = (req, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let data = req.body;
        const schemas = Joi.object({
            username: Joi.string().required().email(),
            password: Joi.string().min(6).required()
        });
        const validation = schemas.validate(data);
        if (validation.error) {
            next({ "status": 400, "success": false, "message": validation.error.details[0].message });
        } else {
            return ({ "status": 200, "success": true, "data": validation.value });
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "status": 500, "success": false, "message": "Internal Server Error" });
    }
}


exports.validateUserSignOutParams = (req, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let headerparams = req.headers;
        let accesstoken = headerparams.accesstoken;
        if (!accesstoken || accesstoken.trim() == '') {
            logger.error("User accesstoken is required in %s ", getName().functionName);
            next({ "success": false, "message": "USER_ACCESS_TOKEN_REQUIRED" });
        }
        logger.info("%s parameters received in headers[accesstoken]: %s", getName().functionName, accesstoken);
        const params = {};
        params["accesstoken"] = accesstoken;
        logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
        return { "success": true, "data": params };
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "status": 500, "success": false, "message": "Internal Server Error" });
    }
}


exports.validateUserChangePasswordParams = (req, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        const bodyparams = req.body;
        const headerparams = req.headers;
        const accesstoken = headerparams.accesstoken;
        const pre_password = bodyparams.pre_password;
        const new_password = bodyparams.new_password;
        const required_parameters_hash = { accesstoken: accesstoken, pre_password: pre_password, new_password: new_password };

        const schemas = Joi.object({
            accesstoken: Joi.string().min(1).required(),
            pre_password: Joi.string().min(6).required(),
            new_password: Joi.string().min(6).required(),
        });
        const validation = schemas.validate(required_parameters_hash);
        if (validation.error) {
            next({ "status": 400, "success": false, "message": validation.error.details[0].message });
        } else {
            return ({ "status": 200, "success": true, "data": validation.value });
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "status": 500, "success": false, "message": "Internal Server Error" });
    }
}


exports.validateForcePasswordChangeParams = (req, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        const bodyparams = req.body;
        const headerparams = req.headers;
        const session = headerparams.session;
        const challengeName = bodyparams.challengeName;
        const username = bodyparams.username;
        const password = bodyparams.password;
        let required_parameters_hash = { session: session, challengeName: challengeName, username: username, password: password }

        const schemas = Joi.object({
            session: Joi.string().min(1).required(),
            challengeName: Joi.string().min(1).required(),
            username: Joi.string().min(6).required(),
            password: Joi.string().min(6).required()
        });
        const validation = schemas.validate(required_parameters_hash);
        if (validation.error) {
            next({ "status": 400, "success": false, "message": validation.error.details[0].message });
        } else {
            return ({ "status": 200, "success": true, "data": validation.value });
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "status": 500, "success": false, "message": "Internal Server Error" });
    }
}


exports.validateForgotPasswordParams = (req, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let data = req.body;
        const schemas = Joi.object({
            username: Joi.string().min(6).required().email()
        });
        const validation = schemas.validate(data);
        if (validation.error) {
            next({ "status": 400, "success": false, "message": validation.error.details[0].message });
        } else {
            return ({ "status": 200, "success": true, "data": validation.value });
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "status": 500, "success": false, "message": "Internal Server Error" });
    }
}


exports.validateConfirmForgotPasswordParams = (req, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let data = req.body;
        const schemas = Joi.object({
            confirmmation_code: Joi.string().min(4).required(),
            email: Joi.string().min(6).required().email(),
            password: Joi.string().min(6).required()
        });
        const validation = schemas.validate(data);
        if (validation.error) {
            next({ "status": 400, "success": false, "message": validation.error.details[0].message });
        } else {
            return ({ "status": 200, "success": true, "data": validation.value });
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "status": 500, "success": false, "message": "Internal Server Error" });
    }
}


exports.validateRefreshTokenParams = (req, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let data = req.body;
        const schemas = Joi.object({
            refreshToken: Joi.string().min(1).required(),
        });
        const validation = schemas.validate(data);
        if (validation.error) {
            next({ "status": 400, "success": false, "message": validation.error.details[0].message });
        } else {
            return ({ "status": 200, "success": true, "data": validation.value });
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "status": 500, "success": false, "message": "Internal Server Error" });
    }
}


exports.userIdFromCognitoDetails = async (req, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        const currentCognitoUserDetails = req.currentUser;
        let params = req.query;
        let platform;
        if (params.filters) {
            let filter = JSON.parse(params.filters);
            platform = filter.platform;
        }
        if (currentCognitoUserDetails) {
            let userParams = currentCognitoUserDetails['custom:user_details'];
            if (userParams) {
                userParams = JSON.parse(userParams);
                //let userId = userParams.user_id;
                // const schemas = Joi.object({
                //     user_id: Joi.number().required(),
                //     user_type: Joi.string().required(),
                //     customer_name: Joi.allow()
                // });
                // const validation = schemas.validate(userParams);

                return ({ "status": 200, "success": true, "data": userParams});
            } else {
                logger.error("User parameters not found in %s ", getName().functionName);
                next({ "status": 400, "success": false, "message": "User_Parameter_Not_Found" });
            }
        } else {
            logger.error("User parameters not found in %s ", getName().functionName);
            next({ "status": 400, "success": false, "message": "User_Details_Not_Found" });
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "status": 500, "success": false, "message": "Internal Server Error" });
    }
}
exports.formatedCurrentUserDetails = async (userdata, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        if (userdata) {
            let userDataHash = {};
            let user_details_hash = {};
            /*let userDataHash = {};
            userDataHash["id"] = userdata.id;
            let user_details_hash = {};
            user_details_hash["user_name"] = userdata.name;
            user_details_hash["user_number"] = userdata.user_number;
            user_details_hash["user_email"] = userdata.email;
            user_details_hash["status"] = userdata.status;
            user_details_hash["type"] = userdata.type;
            if (userdata.type == "app_admin") {
                user_details_hash["org_id"] = "";
                user_details_hash["org_name"] = "";
            } else {
                if (userdata.UserOrgCustUserRelation.length > 0) {
                    if (userdata.UserOrgCustUserRelation[0].OrgUserRelation) {
                        user_details_hash["org_id"] = userdata.UserOrgCustUserRelation[0].OrgUserRelation.id;
                        user_details_hash["org_name"] = userdata.UserOrgCustUserRelation[0].OrgUserRelation.name;
                    }
                    if (userdata.UserOrgCustUserRelation[0].OrgCustUserInformation) {
                        user_details_hash["native_language"] = userdata.UserOrgCustUserRelation[0].OrgCustUserInformation[0].UserLanguage;
                    }
                }
            }
            user_details_hash['profile_img'] = {};
            if (userdata.profile_img_url) {
                var img_string = JSON.parse(userdata.profile_img_url)
                var file_name = img_string.file_name;
                user_details_hash['profile_img']["file_name"] = file_name;
                var url = img_string.img_url;
                var sizeWidth = 0;
                var sizeHeight = 0;

                if (sizeWidth == 0 || sizeHeight == 0) {
                    sizeWidth = 0;
                    sizeHeight = 0;
                }
                let fileBuffer = await getS3Object(url, sizeWidth, sizeHeight);
                user_details_hash['profile_img']["file_obj"] = fileBuffer;

            }
            userDataHash["user_details"] = user_details_hash;*/
            user_details_hash["first_name"] = userdata.first_name;
            user_details_hash["last_name"] = userdata.last_name;
            user_details_hash["contact_number"] = userdata.contact_number;
            user_details_hash["user_email"] = userdata.email;
            user_details_hash["status"] = userdata.status;
            user_details_hash["role_name"] = userdata.user_type;
            user_details_hash['profile_img'] = userdata.profile_img_url;
            userDataHash["id"] = userdata.id;
            userDataHash["user_details"] = user_details_hash;
            logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
            return { "success": true, "data": userDataHash };
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "status": 500, "success": false, "message": "Internal Server Error" });
    }
}