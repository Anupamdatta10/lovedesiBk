const logger = require('../../../logger/logger');
const { getName } = require('../../../logger/logFunctionName');
const { checkOpKeys } = require('../common/searchOpKeys');
const {getS3Object} = require('../../../common_modules/stringToBase64');
const Joi = require('joi');

exports.validateParamsUserCreate = (req, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let data = req;
        const schemas = Joi.object({
            first_name: Joi.string().min(1).required(),
            last_name: Joi.string().min(1).required(),
            contact_number: Joi.string().required(),
            email: Joi.string().min(1).required().email(),
            user_type: Joi.string().min(1).required(),
            profile_img: Joi.allow(),
            status: Joi.boolean().required()
        });
        let validation = schemas.validate(data);
        if (data.profile_img) {
            const next_schemas = Joi.object({
                file_name: Joi.string().min(1).required(),
                file_obj: Joi.string().min(1).required()
            });
            validation = next_schemas.validate(data.profile_img);
        }
        if (validation.error) {
            logger.error(`*** ${validation.error.details[0].message} in %s of %s ***`, getName().functionName, getName().fileName);
            return ({ "status": 400, "success": false, "message": validation.error.details[0].message });
        } else {
            logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
            return ({ "status": 200, "success": true, "data": data });
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        return ({ "status": 500, "success": false, "message": "Internal Server Error" });
    }
}


exports.validateUsersList = async (req, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let id = req.params.id || null;
        let filters = req.query.filters || null;
        let filter_op = req.query.filter_op || null;
        let result = {};
        let data_hash = { "id": id };
        if (filters) {
            let filters_obj = JSON.parse(filters);
            let filter_arr = Object.keys(filters_obj);
            let filter = {};
            filter_arr.forEach(e => {
                filter[e] = filters_obj[e]
            });
            if (Object.keys(filter).length > 0) {
                data_hash["filter"] = filter;
            }
        }
        if (filter_op) {
            let filter_op_obj = JSON.parse(filter_op);
            var isPassedOpKeys = await checkOpKeys(Object.values(filter_op_obj));
            if (!isPassedOpKeys.success) {
                result = {
                    "success": false,
                    "message": isPassedOpKeys.message
                };
                resolve(result);
                return;
            }
            if (Object.keys(filter_op_obj).length > 0) {
                data_hash["filter_op"] = filter_op_obj;
            }
        }
        result = {
            "success": true,
            "data": data_hash
        };
        logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
        return (result);
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "status": 500, "success": false, "message": "Internal Server Error" });
    }
}
exports.formatResponseUsersList = async (params) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    logger.info("*** Starting %s of %s ***", params);
    let result = {};
    if (params.success) {
        // for (let i = 0; i < params.data.length; i++) {
        //     let elements = params.data[i];
        //     elements['Customer'] = [];
        //     for (let k = 0; k < elements.UserOrgCustUserRelation.length; k++) {
        //         if (elements.UserOrgCustUserRelation[k].OrgCustUserRelationCust)
        //             elements['Customer'].push(elements.UserOrgCustUserRelation[k].OrgCustUserRelationCust);
        //         delete elements.UserOrgCustUserRelation[k].OrgCustUserRelationCust;
        //     }
        // }
        result = {
            "status": 200,
            "success": true,
            "total": params.total,
            "message": params.message,
            "data": params.data
        }
        logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
    } else if (params.success === 0) {
        result = {
            "status": 500,
            "success": false,
            "message": params.message
        };
        logger.error(`*** ${params.message} in %s of %s ***`, getName().functionName, getName().fileName);
        //logger.error(params.message || JSON.stringify(params.message));
    }
    return (result);
}


exports.validateUsersListById = async (req, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let id = req.params.id || null;
        let filters = req.query.filters || null;
        let filter_op = req.query.filter_op || null;
        let result = {};
        let data_hash = { "id": id };
        if (filters) {
            let filters_obj = JSON.parse(filters);
            let filter_arr = Object.keys(filters_obj);
            let filter = {};
            filter_arr.forEach(e => {
                filter[e] = filters_obj[e]
            });
            if (Object.keys(filter).length > 0) {
                data_hash["filter"] = filter;
            }
        }
        if (filter_op) {
            let filter_op_obj = JSON.parse(filter_op);
            var isPassedOpKeys = await checkOpKeys(Object.values(filter_op_obj));
            if (!isPassedOpKeys.success) {
                result = {
                    "success": false,
                    "message": isPassedOpKeys.message
                };
                resolve(result);
                return;
            }
            if (Object.keys(filter_op_obj).length > 0) {
                data_hash["filter_op"] = filter_op_obj;
            }
        }
        result = {
            "success": true,
            "data": data_hash
        };
        logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
        return (result);
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "status": 500, "success": false, "message": "Internal Server Error" });
    }
}
exports.formatResponseUsersListById = async (params) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    logger.info("*** Starting %s of %s ***", params);
    let result = {};
    if (params.success) {
        for(let i = 0; i< params.data.length; i++) {
            let profile_img = params.data[i].profile_img_url;
            if(profile_img) {
                let profile_img_string = JSON.parse(profile_img);
                let file_name = profile_img_string.file_name;
                let url = profile_img_string.img_url;
                let sizeWidth  = parseInt(params.height);
                let sizeHeight = parseInt(params.width);
                let fileBuffer = await getS3Object(url,sizeWidth,sizeHeight);
                params.data[i]["profile_img"] = {}
                params.data[i]["profile_img"]["file_name"] = file_name;
                params.data[i]["profile_img"]["file_obj"] = fileBuffer;
            } else {
                params.data[i]["profile_img"] = {}
            }
            delete params.data[i].profile_img_url;
        }
        result = {
            "status": 200,
            "success": true,
            "total": params.total,
            "message": params.message,
            "data": params.data
        }
        logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
    } else if (params.success === 0) {
        result = {
            "status": 500,
            "success": false,
            "message": params.message
        };
        logger.error(`*** ${params.message} in %s of %s ***`, getName().functionName, getName().fileName);
        logger.error(params.message || JSON.stringify(params.message));
    }
    return (result);
}

exports.validateUsersDetailsList = async (req, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let id = req.params.id || null;
        let filters = req.query.filters || null;
        let filter_op = req.query.filter_op || null;
        let result = {};
        let data_hash = { "id": id };
        if (filters) {
            let filters_obj = JSON.parse(filters);
            let filter_arr = Object.keys(filters_obj);
            let filter = {};
            filter_arr.forEach(e => {
                filter[e] = filters_obj[e]
            });
            if (Object.keys(filter).length > 0) {
                data_hash["filter"] = filter;
            }
        }
        if (filter_op) {
            let filter_op_obj = JSON.parse(filter_op);
            var isPassedOpKeys = await checkOpKeys(Object.values(filter_op_obj));
            if (!isPassedOpKeys.success) {
                result = {
                    "success": false,
                    "message": isPassedOpKeys.message
                };
                resolve(result);
                return;
            }
            if (Object.keys(filter_op_obj).length > 0) {
                data_hash["filter_op"] = filter_op_obj;
            }
        }
        result = {
            "success": true,
            "data": data_hash
        };
        logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
        return (result);
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "status": 500, "success": false, "message": "Internal Server Error" });
    }
}
exports.formatResponseUsersDetailsList = async (params) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    logger.info("*** Starting %s of %s ***", params);
    let result = {};
    if (params.success) {
        let hash_arr = [];
        for (let i = 0; i < params.data.length; i++) {
            let org_details_hash = {};
            let element = params.data[i];
            org_details_hash["id"] = element.id;
            org_details_hash["name"] = element.name;
            org_details_hash["user_number"] = element.user_number;
            org_details_hash["email"] = element.email;
            org_details_hash["type"] = element.type;
            org_details_hash["company_name"] = element.company_name;
            org_details_hash["status"] = element.status;
            org_details_hash["address"] = element.address;
            org_details_hash["phone_no"] = element.phone_no;
            org_details_hash['profile_img'] = {}
            if (element.profile_img_url) {
                var img_string = JSON.parse(element.profile_img_url)
                var file_name = img_string.file_name;
                org_details_hash['profile_img']["file_name"] = file_name;
                var url = img_string.img_url;
                var sizeWidth = 0;
                var sizeHeight = 0;

                if (sizeWidth == 0 || sizeHeight == 0) {
                    sizeWidth = 0;
                    sizeHeight = 0;
                }
                let fileBuffer = await getS3Object(url, sizeWidth, sizeHeight);
                org_details_hash['profile_img']["file_obj"] = fileBuffer;
            }
            hash_arr.push(org_details_hash);
        }
        result = {
            "status": 200,
            "success": true,
            "total": params.total,
            "message": params.message,
            "data": hash_arr
        }
        logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
    } else if (params.success === 0) {
        result = {
            "status": 500,
            "success": false,
            "message": params.message
        };
        logger.error(`*** ${params.message} in %s of %s ***`, getName().functionName, getName().fileName);
        logger.error(params.message || JSON.stringify(params.message));
    }
    return (result);
}

exports.validateUserUpdate = (req, next) => {
    try {
        logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
        let data = req.body;
        let id = req.params.id;
        let data_validate = {};
        let data_validate_for_profile_img = {};
        if (Object.keys(data).length == 0) {
            next({ "status": 400, "success": false, "message": "Required_Parameters_Are_Missing" });
        }
        if (!id) {
            next({ "status": 400, "success": false, "message": "Id_Is_Required" });
        }
        if (data.hasOwnProperty('first_name')) {
            data_validate['first_name'] = Joi.string().min(1).required()
        }
        if (data.hasOwnProperty('last_name')) {
            data_validate['last_name'] = Joi.string().min(1).required()
        }
        if (data.hasOwnProperty('email')) {
            data_validate['email'] = Joi.string().min(1).required().email()
        }
        if (data.hasOwnProperty('user_type')) {
            data_validate['user_type'] = Joi.string().min(1).required()
        }
        if (data.hasOwnProperty('contact_number')) {
            data_validate['contact_number'] = Joi.string().required()
        }
        if (data.hasOwnProperty('profile_img')) {
            data_validate['profile_img'] = Joi.object()
        }
        if (data.hasOwnProperty('status')) {
            data_validate['status'] = Joi.number().required()
        }
        const schemas = Joi.object().keys(data_validate);
        let validation = schemas.validate(data);
        if (data.hasOwnProperty('profile_img')) {
            data_validate_for_profile_img['file_name'] = Joi.string().min(1).required()
            data_validate_for_profile_img['file_obj'] = Joi.string().min(1).required()

            const schemas_for_logo_img = Joi.object().keys(data_validate_for_profile_img);
            validation = schemas_for_logo_img.validate(data.profile_img);
        }
        if (validation.error) {
            logger.error(`* ${validation.error.details[0].message} in %s of %s *`, getName().functionName, getName().fileName);
            next({ "status": 400, "success": false, "message": validation.error.details[0].message });
        } else {
            logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
            return ({ "status": 200, "success": true, "data": data, "id": id });
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "status": 500, "success": false, "message": "Internal Server Error" });
    }
}
exports.formatResponseUserUpdate = (params) => {
    logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
    let result = {};
    if (params.success) {
        result = {
            "status": 200,
            "username": params.email,
            "success": true,
            "message": params.message
        };
    }
    return (result);
}


exports.validateUserDelete = (req, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let data = req.body;
        const schemas = Joi.object({
            id: Joi.array().min(1).required(),
        });
        const validation = schemas.validate(data);
        if (validation.error) {
            logger.error(`*** ${validation.error.details[0].message} in %s of %s ***`, getName().functionName, getName().fileName);
            next({ "status": 400, "success": false, "message": validation.error.details[0].message });
        } else {
            logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
            return ({ "status": 200, "success": true, "data": validation.value });
        }
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "status": 500, "success": false, "message": "Internal Server Error" });
    }
}
exports.formatResponseUserDelete = (params) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    let result = {};
    if (params.success) {
        result = {
            "status": 200,
            "success": true,
            "data": params.data
        };
        logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
    }
    return (result);
}