const Joi = require("joi");
const { checkOpKeys } = require('../common/searchOpKeys');
const logger = require('../../../logger/logger');
const { getName } = require('../../../logger/logFunctionName');

exports.validateUserDetailsCreate = (req, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let data = req;
        let data_validate = {};

        data_validate['address'] = Joi.string();
        //data_validate['img_url'] = Joi.string();
        data_validate['user_id'] = Joi.string().required();
        data_validate['status'] = Joi.string();

        let schemas = Joi.object().keys(data_validate);
        let validation = schemas.validate(data);
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
        return ({ "status": 500, "success": false, "message": "Something went wrong" });
    }
}

exports.formatResponseUserDetailsCreateData = (params) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let result = {};
        if (params.success) {
            result = {
                "status": 200,
                "success": true,
                "message": "User Details created successfully",
                "data": params.data
            };
            logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
        } else if (!params.success) {
            result = {
                "status": params.status,
                "success": false,
                "message": params.message,
                "data": params
            };
            logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
        }
        return (result);
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "status": 500, "success": false, "message": "Something went wrong" });
    }
}

exports.validateUserDetailsListData = async (req, next) => {
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
        next({ "status": 500, "success": false, "message": "Something went wrong" });
    }
};

exports.formatResponseUserDetailsListData = (params) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let result = {};
        if (params.success) {
            for (let i = 0; i < params.data.length; i++) {
                params.data[i]["org_name"] = params.data[i]?.TemplatesOrgRelation?.name;
                params.data[i]["version_id"] = params.data[i].TemplatesVersionRelation ? params.data[i].TemplatesVersionRelation.id : null;
                params.data[i]["version_name"] = params.data[i].TemplatesVersionRelation ? params.data[i].TemplatesVersionRelation.version : null;
                delete params.data[i].TemplatesOrgRelation
                delete params.data[i].TemplatesVersionRelation
            }
            result = {
                "status": 200,
                "success": true,
                "total": params.total,
                "data": params.data
            };
            logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
        } else if (!params.success) {
            result = {
                "status": params.status,
                "total": params.total,
                "success": false,
                "message": params.message,
                "data": params
            };
            logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
        }
        return (result);
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "status": 500, "success": false, "message": "Something went wrong" });
    }
}

exports.validateUserDetailsUpdateData = (req, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let data = req.body;
        let id = req.params.id;
        let data_validate = {};
        data_validate['address'] = Joi.string();
        //data_validate['img_url'] = Joi.string();
        data_validate['user_id'] = Joi.string().required();
        data_validate['status'] = Joi.string();


        let schemas = Joi.object().keys(data_validate);
        let validation = schemas.validate(data);
        if (id) {
            if (validation.error) {
                logger.error(`*** ${validation.error.details[0].message} in %s of %s ***`, getName().functionName, getName().fileName);
                return ({ "status": 400, "success": false, "message": validation.error.details[0].message });
            } else {
                logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
                return ({ "status": 200, "success": true, "data": data, "id": id });
            }
        } else {
            logger.error(`*** "id is required" in %s of %s ***`, getName().functionName, getName().fileName);
            return ({ "status": 400, "success": false, "message": "id is required!" });
        }


    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        return ({ "status": 500, "success": false, "message": "Something went wrong" });
    }
}

exports.formatResponseUserDetailsUpdateData = (params) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let result = {};
        if (params.success) {
            result = {
                "status": 200,
                "success": true,
                "message": "Updated successfully",
                "data": params.data
            };
            logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
        } else if (!params.success) {
            result = {
                "status": params.status,
                "success": false,
                "message": params.message,
                "data": params
            };
            logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
        }
        return (result);
    } catch (err) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(err.message || JSON.stringify(err));
        next({ "status": 500, "success": false, "message": "Something went wrong" });
    }
}

exports.validateUserDetailsDelete = (req, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let data = req.body;
        const schemas = Joi.object({
            id: Joi.array().min(1).required(),
        });
        const validation = schemas.validate(data);
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
        next({ "status": 500, "success": false, "message": "Something went wrong" });
    }
}
exports.formatResponseUserDetailsDeleteData = (params) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    let result = {};
    if (params.success) {
        result = {
            "status": 200,
            "success": true,
            "data": params.data
        };
        logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
    } else {
        result = {
            "status": params.status,
            "success": false,
            "data": params.data
        };
        logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
    }
    return (result);
}