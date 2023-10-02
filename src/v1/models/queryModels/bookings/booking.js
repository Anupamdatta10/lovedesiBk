const db = require('../../index');
const { Op } = require("sequelize");
const logger = require('../../../../logger/logger');
const { getName } = require('../../../../logger/logFunctionName');
const moment = require('moment');
const s3 = require('../../../../common_modules/aws_s3');
const axios = require('axios');
const EV = require('../../../../environment/index');


exports.bookingDetailsData = async (params, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        params = params.data;
        // let dataEx = await db.BookingDetails.findOne({ where: { name: params.name, org_id: org_id } });
        // if (!dataEx) {
        let results = await db.BookingDetails.create(params);
        logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
        return { success: true, data: results }
        // } else {
        //     return { success: false, message: 'store details already exist', status: 409 }
        // }
    } catch (error) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(error.message || JSON.stringify(error));
        let errorMsg = "Internal server error";
        next({ "message": errorMsg, "success": false, "status": 500 });
    }

};


exports.bookingDetailsListData = async (params, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        params = params.data;
        var inner_params = {};
        if (params.id) {
            inner_params["id"] = params.id;
        }
        if (params.filter) {
            if (Object.keys(params.filter).length > 0) {
                let filterKeys = Object.keys(params.filter);
                let TemplateData = db.BookingDetails.rawAttributes;
                TemplateData = Object.keys(TemplateData);
                filterKeys.forEach(filterKey => {
                    if (TemplateData.includes(filterKey)) {
                        inner_params[filterKey] = params.filter[filterKey]
                    }
                })
            }
            if (params.filter_op) {
                if (Object.keys(params.filter_op).length > 0) {
                    let filter_op = params.filter_op;
                    let filter_op_keys = Object.keys(params.filter_op);
                    filter_op_keys.forEach(filterOpKey => {
                        if ((!(filterOpKey == "offset" || filterOpKey == "limit"))) {
                            inner_params[filterOpKey] = { [Op[filter_op[filterOpKey]]]: params.filter[filterOpKey] }
                        }
                    })
                }
            }

        }

        let findAllData = {
            where: inner_params,
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        }
        if (params.filter && params.filter.hasOwnProperty('offset') && params.filter.hasOwnProperty('limit')) {
            let offset = typeof params.filter.offset == 'string' ? parseInt(params.filter.offset) : params.filter.offset;
            let limit = typeof params.filter.limit == 'string' ? parseInt(params.filter.limit) : params.filter.limit;
            findAllData["offset"] = offset;
            findAllData["limit"] = limit;
        }
        let result = await db.BookingDetails.findAll(findAllData);
        if (!params.filter || (params.filter && (!params.filter.total || parseInt(params.filter.total) == 0))) {
            delete findAllData.offset;
            delete findAllData.limit;
            let count = await db.BookingDetails.findAll(findAllData);
            logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
            return ({ data: JSON.parse(JSON.stringify(result)), total: count.length, success: true });
        } else {
            logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
            return ({ data: JSON.parse(JSON.stringify(result)), total: parseInt(params.filter.total), success: true });
        }
    } catch (error) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(error.message || JSON.stringify(error));
        let errorMsg = "Internal server error";
        next({ "message": errorMsg, "success": false, "status": 500 });
    }

};

exports.bookingDetailsUpdateData = async (params, userId, org_id, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let id = params.id;
        params = params.data;
        let dataExist = await db.BookingDetails.findOne({ where: { id: id } });
        if (dataExist != null) {
            //let duplicate_checking = await db.BookingDetails.findOne({ where: { name: params.name } });
            // if (duplicate_checking != null) {
            //     logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
            //     return ({ success: false, message: 'store already exist', status: 409 })
            // } else {
            let results = await db.BookingDetails.update(params, { where: { id: id } });
            if (results[0] == 0) {
                logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
                return ({ "message": "Update Can Not Be Performed", "success": false, "status": 405 })
            } else {
                logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
                return { success: true, data: {} }
            }
            // }

        } else {
            logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
            return { success: false, data: {}, message: "Data does not exist", status: 404 }
        }
    } catch (error) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(error.message || JSON.stringify(error));
        let errorMsg = "Internal server error";
        next({ "message": errorMsg, "success": false, "status": 500 });
    }

}

exports.bookingDetailsDeleteData = async (params) => {
    logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
    try {
        var id = params.data.id;
        var _arr = [];
        var count = 0;
        for (var i = 0; i < id.length; i++) {
            var dataExists = await db.BookingDetails.findOne({
                where: { id: id[i] }
            });
            if (dataExists == null) {
                var _hash = { "success": false }
                _hash["data"] = { "id": id[i] };
                _hash["message"] = "Id does not exist";
                _hash["status"] = 404;
                _arr.push(_hash);
                count = count + 1;
            } else {
                dataExists = JSON.parse(JSON.stringify(dataExists));
                var result = await db.BookingDetails.destroy({
                    where: { id: id[i] }
                });
                if (result > 0) {
                    var _hash = { "success": true };
                    _hash["data"] = { "id": id[i] };
                    _hash["message"] = `Booking deleted successfully`;
                    _arr.push(_hash);
                } else {
                    logger.error("* Error in %s of %s *", getName().functionName, getName().fileName);
                    return ({ "message": "Delete cannot be performed", "success": false });
                }
            }
            if (_arr.length == id.length) {

                if (_arr.length == count) {
                    logger.error("* Error in %s of %s *", getName().functionName, getName().fileName);
                    return ({ "data": _arr, "success": false });
                } else {
                    logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
                    return ({ "data": _arr, "success": true });
                }
            }
        }
    } catch (error) {
        logger.error("* Error in %s of %s *", getName().functionName, getName().fileName);
        logger.error(error.message || JSON.stringify(error));
        let errorMsg = error.message || JSON.stringify(error);;
        next({ "success": false, "message": "Something went wrong" });
    }
}