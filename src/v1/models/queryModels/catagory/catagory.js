const db = require('../../index');
const { Op } = require("sequelize");
const logger = require('../../../../logger/logger');
const { getName } = require('../../../../logger/logFunctionName');
const moment = require('moment');
const s3 = require('../../../../common_modules/aws_s3');
const EV = require('../../../../environment/index');


exports.CatagoryData = async (params, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        params = params.data;
        let data={}
        data["image_url"]=JSON.parse(JSON.stringify(params.image_url));
        delete params.image_url;
        let dataExist = await db.Catagory.findOne({ where: { name: params.name } });
        if (dataExist) {
            logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
            return { success: false, data: [], message: "already exist!","status": 400  }
        } else {
            let results = await db.Catagory.create(params);
            let id = JSON.parse(JSON.stringify(results)).id;
            if (results && data.image_url) {
                idxDot = data.image_url.file_name.lastIndexOf(".");
                extFile = data.image_url.file_name.substr(idxDot, data.image_url.file_name.length).toLowerCase();
                let org_name = id + "_" + moment().format('YYYYMMDDSSsss') + extFile;
                var buffer = data.image_url.file_obj.split(',');
                var buffer_str = Buffer.from(buffer[1], 'base64');
    
                let upload_link = await s3.uploadToS3(buffer_str, 'Catagory_images', org_name);
                var imageHash = JSON.stringify({ "file_name": data.image_url.file_name, "img_url": upload_link });
                await db.Catagory.update({ "image_url": imageHash }, { where: { id: id } });
            }
            logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
            return { success: true, data: results }
        }

    } catch (error) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(error.message || JSON.stringify(error));
        let errorMsg = "Internal server error";
        next({ "message": errorMsg, "success": false, "status": 500 });
    }

};


exports.CatagoryListData = async (params, org_id, next) => {
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
                let TemplateData = db.Catagory.rawAttributes;
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
        let result = await db.Catagory.findAll(findAllData);
        if (!params.filter || (params.filter && (!params.filter.total || parseInt(params.filter.total) == 0))) {
            delete findAllData.offset;
            delete findAllData.limit;
            let count = await db.Catagory.findAll(findAllData);
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

exports.CatagoryUpdateData = async (params, userId, org_id, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let id = params.id;
        params = params.data;
        let data={}
        if(params.hasOwnProperty('image_url')){
            data["image_url"]=JSON.parse(JSON.stringify(params.image_url));
            delete params.image_url;
        }
        let dataExist = await db.Catagory.findOne({ where: { id: id } });
        if (dataExist != null) {

            let results = await db.Catagory.update(params, { where: { id: id } });

            if (results && data.image_url) {
                idxDot = data.image_url.file_name.lastIndexOf(".");
                extFile = data.image_url.file_name.substr(idxDot, data.image_url.file_name.length).toLowerCase();
                let org_name = id + "_" + moment().format('YYYYMMDDSSsss') + extFile;
                var buffer = data.image_url.file_obj.split(',');
                var buffer_str = Buffer.from(buffer[1], 'base64');
    
                let upload_link = await s3.uploadToS3(buffer_str, 'Catagory_images', org_name);
                var imageHash = JSON.stringify({ "file_name": data.image_url.file_name, "img_url": upload_link });
                await db.Catagory.update({ "image_url": imageHash }, { where: { id: id } });
            }
            if (results[0] == 0) {
                logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
                return ({ "message": "Update Can Not Be Performed", "success": false, "status": 405 })
            } else {
                logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
                return { success: true, data: {} }
            }

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

exports.CatagoryDeleteData = async (params) => {
    logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
    try {
        var id = params.data.id;
        var _arr = [];
        var count = 0;
        for (var i = 0; i < id.length; i++) {
            var dataExists = await db.Catagory.findOne({
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
                var result = await db.Catagory.destroy({
                    where: { id: id[i] }
                });
                if (result > 0) {
                    var _hash = { "success": true };
                    _hash["data"] = { "id": id[i] };
                    _hash["message"] = `catagory deleted successfully`;
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