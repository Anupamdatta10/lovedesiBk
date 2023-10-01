const db = require('../../index');
const s3 = require('../../../../common_modules/aws_s3');
const EV = require('../../../../environment');
const { Op } = require("sequelize");
const logger = require('../../../../logger/logger');
const { getName } = require('../../../../logger/logFunctionName');
const moment = require('moment');
const sequelize = require('sequelize');
const Sequelize = require("../../../../../database/connection");
const {
    adminDeleteUser,
    adminDisableUser,
    adminEnableUser,
} = require('../../../../auth/users/cognito/cognitoAuthenticationSystem');



exports.userCreate = async (params, created_by, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        var user_details = params.data;
        let result = "";
        let id = "";
        user_details["user_type"] = user_details.user_type;
        //user_details["created_by"] = created_by;
        let data_exist = await db.User.findOne({ where: { email: user_details.email } });
        data_exist = JSON.parse(JSON.stringify(data_exist));
        if (data_exist == null) {
        result = await db.User.create(user_details);

        id = JSON.parse(JSON.stringify(result)).id;
        if (result && user_details.profile_img) {
            idxDot = user_details.profile_img.file_name.lastIndexOf(".");
            extFile = user_details.profile_img.file_name.substr(idxDot, user_details.profile_img.file_name.length).toLowerCase();
            let user_name = id + "_" + user_details.first_name.trim().replace(' ', '_') + extFile;
            var buffer = user_details.profile_img.file_obj.split(',');
            var buffer_str = Buffer.from(buffer[1], 'base64');

            let upload_link = await s3.uploadToS3(buffer_str, 'examinees_profile_img', user_name);
            var imageHash = JSON.stringify({ "file_name": user_details.profile_img.file_name, "img_url": upload_link });
            await db.User.update({ "profile_img_url": imageHash }, { where: { id: id } });
        }
        logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
        return ({ "data": JSON.parse(JSON.stringify(result)), "success": true })
    } else{
        logger.error("* Username already exist in %s of %s *", getName().functionName, getName().fileName);
        return ({ "success": false, "message": "User Already Exist", "status": 409 });
    }
    } catch (error) {
        logger.error("* Error in %s of %s *", getName().functionName, getName().fileName);
        logger.error(error.message || JSON.stringify(error));
        if (error.message == "Validation error") {
            logger.error("* Username already exist in %s of %s *", getName().functionName, getName().fileName);
            return ({ "success": false, "message": "Username_Already_Exist", "status": 409 });
        } else {
            return({ "success": false, "message": "Internal Server Error" });
        }
    }
}

exports.usersList = async (params, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let userWhereArr = [];
        params = params.data;
        var inner_hash = {id:{[Op.ne]:1}};
        if (params.id) {
            inner_hash["id"] = params.id;
        }
        else if (params.filter) {
            if (Object.keys(params.filter).length > 0) {
                let filterKeys = Object.keys(params.filter);
                filterKeys.forEach(filterKey => {
                    if ((!(filterKey == "offset" || filterKey == "limit" || filterKey == "search_attr"))) {
                        inner_hash[filterKey] = params.filter[filterKey];
                    }
                })
            }
            if (params.filter_op) {
                if (Object.keys(params.filter_op).length > 0) {
                    let filter_op = params.filter_op;
                    let filter_op_keys = Object.keys(params.filter_op);
                    filter_op_keys.forEach(filterOpKey => {
                        if ((!(filterOpKey == "offset" || filterOpKey == "limit"))) {
                            if (filterOpKey == "search_attr") {
                                let searchStr = params.filter[filterOpKey].replace(/_/g, '\\_');
                                userWhereArr = [
                                    sequelize.where(sequelize.fn('concat', sequelize.col('first_name'), ' ', sequelize.col('last_name')), {
                                        [Op[filter_op[filterOpKey]]]: searchStr
                                    })
                                ]
                            } else {
                                inner_hash[filterOpKey] = { [Op[filter_op[filterOpKey]]]: params.filter[filterOpKey] }
                            }
                        }
                    })
                }
            }
        }
        var findAll_hash = {
            //subQuery: false,
            where: { [Op.and]: [userWhereArr, inner_hash] },
            attributes: { exclude: ['created_by', 'createdAt', 'updatedAt'] }
        };
        if (params.filter && params.filter.hasOwnProperty('offset') && params.filter.hasOwnProperty('limit')) {
            let offset = typeof params.filter.offset == 'string' ? parseInt(params.filter.offset) : params.filter.offset;
            let limit = typeof params.filter.limit == 'string' ? parseInt(params.filter.limit) : params.filter.limit;
            findAll_hash["offset"] = offset;
            findAll_hash["limit"] = limit;
        }
        var result = await db.User.findAll(findAll_hash);
        if (!params.filter || (params.filter && (!params.filter.total || parseInt(params.filter.total) == 0))) {
            delete findAll_hash.offset;
            delete findAll_hash.limit;
            var count = await db.User.findAll(findAll_hash);
            logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
            return ({ "data": JSON.parse(JSON.stringify(result)), "total": count.length, "success": true });
        } else {
            logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
            return ({ "data": JSON.parse(JSON.stringify(result)), "total": parseInt(params.filter.total), "success": true });
        }

    } catch (error) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(error.message || JSON.stringify(error));
        let errorMsg = error.message || JSON.stringify(error);
        next({ "success": false, "message": "Internal Server Error" });
    }
}



exports.userListById = async (params) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        var inner_hash = {};
        let userWhereArr = [];
        inner_hash["id"] = {
            [Op.ne]: 1
        }
        params = params.data;

        if (params.id) {
            inner_hash["id"] = params.id;
        } else if (params.filter) {
            if (Object.keys(params.filter).length > 0) {
                let filterKeys = Object.keys(params.filter);
                filterKeys.forEach(filterKey => {
                    if (!(filterKey == "offset" || filterKey == "limit"  || filterKey == "search_attr" || filterKey == "size_width" || filterKey == "size_height")) {
                        inner_hash[filterKey] = params.filter[filterKey];
                    }
                })
            }
            if (params.filter_op) {
                if (Object.keys(params.filter_op).length > 0) {
                    let filter_op = params.filter_op;
                    let filter_op_keys = Object.keys(params.filter_op);
                    filter_op_keys.forEach(filterOpKey => {

                        if (!(filterOpKey == "offset" || filterOpKey == "limit")) {
                            if (filterOpKey == "search_attr") {
                                let searchStr = params.filter[filterOpKey].replace(/_/g, '\\_');
                                userWhereArr = [
                                    sequelize.where(sequelize.fn('concat', sequelize.col('first_name'), ' ', sequelize.col('last_name')), {
                                        [Op[filter_op[filterOpKey]]]: searchStr
                                    })
                                ]
                            } else {
                                inner_hash[filterOpKey] = { [Op[filter_op[filterOpKey]]]: params.filter[filterOpKey] }
                            }
                        }
                    })
                }
            }
        }

        var findAll_hash = {
            where: { [Op.and]: [userWhereArr, inner_hash] },
            attributes: ['id', 'profile_img_url', 'first_name', 'last_name','user_type','email',
            'contact_number', 'status']
        };
        if (params.filter && params.filter.hasOwnProperty('offset') && params.filter.hasOwnProperty('limit')) {
            let offset = typeof params.filter.offset == 'string' ? parseInt(params.filter.offset) : params.filter.offset;
            let limit = typeof params.filter.limit == 'string' ? parseInt(params.filter.limit) : params.filter.limit;
            findAll_hash["offset"] = offset;
            findAll_hash["limit"] = limit;
        }
        var result = await db.User.findAll(findAll_hash);
        if (!params.filter || (params.filter && (!params.filter.total || parseInt(params.filter.total) == 0))) {
            delete findAll_hash.offset;
            delete findAll_hash.limit;
            var count = await db.User.findAll(findAll_hash);

            logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
            return ({ "data": JSON.parse(JSON.stringify(result)), "total": count.length, "height": params.filter.size_height, "width": params.filter.size_width,"success":true });
        } else {
            logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
            return ({ "data": JSON.parse(JSON.stringify(result)), "total": parseInt(params.filter.total),  "success":true });
        }
    } catch (error) {
        logger.error("* Error in %s of %s *", getName().functionName, getName().fileName);
        logger.error(error.message || JSON.stringify(error));
        let errorMsg = error.message || JSON.stringify(error);;
        next({ "success": false, "message": "Internal Server Error" });
    }
}

exports.userUpdate = async (params, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        var id = params.id;
        var data = params.data;
        var dataExists = await db.User.findOne({ where: { id: id } });
        dataExists = JSON.parse(JSON.stringify(dataExists));
        if (dataExists != null) {
            let user_email = dataExists.email;
            var params = {
                UserPoolId: EV.AWS_POOL_ID, /* required */
                Username: user_email /* required */
            };
            if (data.status == 1) {
                await adminEnableUser(params, next, (response) => {
                    if (response.success) {
                        logger.info("*** User enabled successfully in cognito in %s of %s ***", getName().functionName, getName().fileName);
                    } else {
                        logger.error("*** Error while accessing in %s method of %s ***", getName().functionName, getName().fileName);
                    }
                });
            } else if (data.status == 0) {
                await adminDisableUser(params, next, (response) => {
                    if (response.success) {
                        logger.info("*** User disabled successfully in cognito in %s of %s ***", getName().functionName, getName().fileName);
                    } else {
                        logger.error("*** Error while accessing in %s method of %s ***", getName().functionName, getName().fileName);
                    }
                });
            }

            let updateData = await db.User.update(
                data, {
                where: { id: id }
            });
            if (data.profile_img) {
                var _arr = [];
                var _hash = {};
                if (dataExists.profile_img_url) {
                    _hash["Key"] = dataExists.profile_img_url;
                    _arr.push(_hash);
                    var deleteProfileImg = await s3.deleteFromS3(_arr);
                }
                idxDot = data.profile_img.file_name.lastIndexOf(".");
                extFile = data.profile_img.file_name.substr(idxDot, data.profile_img.file_name.length).toLowerCase();
                let user_name = dataExists.name + extFile;
                var buffer = data.profile_img.file_obj.split(',');
                var buffer_str = Buffer.from(buffer[1], 'base64');

                let upload_link = await s3.uploadToS3(buffer_str, 'examinees_profile_img', user_name);
                var imageHash = JSON.stringify({ "file_name": data.profile_img.file_name, "img_url": upload_link });
                updateData = await db.User.update({ "profile_img_url": imageHash }, { where: { id: id } });
            }
            if (updateData[0] == 0) {
                logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
                next({ "message": "Update Can Not Be Performed", "success": false, "status": 405 })
            } else {
                logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
                return ({ "message": "Updated_Successfully", "success": true, "email": dataExists.email })
            }
        } else {
            logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
            next({ "message": "Id_Does_Not_Exist", "success": false, "status": 404 })
        }
    } catch (error) {
        logger.error("* Error in %s of %s *", getName().functionName, getName().fileName);
        logger.error(error.message || JSON.stringify(error));
        let errorMsg = error.message || JSON.stringify(error);;
        next({ "success": false, "message": "Internal Server Error" });
    }
}

exports.userDelete = async (params, next) => {
    logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
    try {
        var id = params.data.id;
        var _arr = [];
        var count = 0;
        for (var i = 0; i < id.length; i++) {
            var dataExists = await db.User.findOne({
                where: { id: id[i] }
            });
            if (dataExists == null) {
                var _hash = { "success": false }
                _hash["data"] = { "id": id[i] };
                _hash["message"] = "Id_Does_Not_Exist";
                _arr.push(_hash);
                count = count + 1;
            } else {
                var result = await db.User.destroy({
                    where: { id: id[i] }
                });
                if (result > 0) {
                    var params = {
                        UserPoolId: EV.AWS_POOL_ID, /* required */
                        Username: dataExists.email /* required */
                    };
                    await adminDeleteUser(params, next, (response) => {
                        if (response.success) {
                            logger.info("*** Ending of userDelete method in %s of %s ***", getName().functionName, getName().fileName);
                        } else {
                            logger.error("*** Error while accessing userDelete method in %s of %s ***", getName().functionName, getName().fileName);
                        }
                    });
                    if (dataExists.profile_img_url) {
                        var imgHash = {};
                        var imgArr = [];
                        imgHash["Key"] = JSON.parse(dataExists.profile_img_url).img_url;
                        imgArr.push(imgHash);
                        var deleteImg = await s3.deleteFromS3(imgArr);
                    }
                    var _hash = { "success": true };
                    _hash["data"] = { "id": id[i] };
                    _hash["message"] = 'deleted successfully';
                    _arr.push(_hash);
                } else {
                    logger.error("* Error in %s of %s *", getName().functionName, getName().fileName);
                    next({ "message": "Deletion_Can_Not_Be_Performed", "success": false });
                }
            }
            if (_arr.length == id.length) {
                if (_arr.length == count) {
                    logger.error("* Error in %s of %s *", getName().functionName, getName().fileName);
                    next({ "message": _arr, "success": false });
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
        next({ "success": false, "message": "Internal Server Error" });
    }
}