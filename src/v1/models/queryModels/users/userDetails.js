const db = require('../../index');
const { Op } = require("sequelize");
const logger = require('../../../../logger/logger');
const { getName } = require('../../../../logger/logFunctionName');
const moment = require('moment');
const s3 = require('../../../../common_modules/aws_s3');
const axios = require('axios');
const EV = require('../../../../environment/index');

// db.Organisation.hasMany(db.Template, { as: "TemplatesOrgRelation", foreignKey: "org_id" });
//db.Template.belongsTo(db.Organisation, { as: "TemplatesOrgRelation", foreignKey: "org_id" });

//db.VersionControl.hasMany(db.Template, { as: "TemplatesVersionRelation", foreignKey: "version_id" });
//db.Template.belongsTo(db.VersionControl, { as: "TemplatesVersionRelation", foreignKey: "version_id" });

exports.userDetailsData = async (params, userId, org_id, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        params = params.data;
        let org_details = await db.Organisation.findOne({ where: { id: org_id } });
        org_details = JSON.parse(JSON.stringify(org_details));
        let version_control = await db.VersionControl.findOne({ where: { id: org_details.version_id } });
        version_control = JSON.parse(JSON.stringify(version_control));
        let template_details = await db.Template.findAll({ where: { org_id: org_id } });
        if (version_control.template_count == null || (version_control.template_count > template_details.length) || template_details.length == 0) {
            let button_flag = await get_template_buttons(JSON.parse(params.template).template, org_id);
            if (button_flag) {
                let template_name = params.template_name;
                if (params.template_name.includes(" ")) {
                    template_name = template_name.replace(/\s+/g, "_");
                }
                let now = Date.now();
                let timeStamp = now.toString();
                let org_data = await db.Organisation.findOne({ where: { id: org_id } });
                org_data = JSON.parse(JSON.stringify(org_data));
                let version_id = org_data.version_id;
                let data = {
                    "message_id": `${(template_name).toLowerCase()}_${org_id}_${timeStamp}`,
                    "template_name": params.template_name,
                    "template_type": params.template_type,
                    "template": params.template,
                    "version_id": version_id,
                    "org_id": org_id,
                    "created_by": userId
                }
                let dataEx = await db.Template.findOne({ where: { template_name: params.template_name, org_id: org_id } });
                if (!dataEx) {
                    let results = await db.Template.create(data);
                    await create_template_actions(JSON.parse(params.template), results.id, org_id);
                    logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
                    return { success: true, data: results }
                } else {
                    return { success: false, message: 'Template already exist', status: 409 }
                }
            } else {
                return { success: false, message: 'Button id already exist, change the button id to create the template', status: 409 }
            }
        } else {
            logger.error("* You have reached template creation limit. Please contact the administrator for further assistance. in %s of %s *", getName().functionName, getName().fileName);
            return ({ "success": false, "message": "You have reached template creation limit. Please contact the administrator for further assistance.", "status": 406 });
        }
    } catch (error) {
        logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
        logger.error(error.message || JSON.stringify(error));
        let errorMsg = "Internal server error";
        next({ "message": errorMsg, "success": false, "status": 500 });
    }

};

async function create_template_actions(template_raw_obj, template_id, org_id) {
    template = template_raw_obj["template"]
    button_web_hooks_obj = template_raw_obj["button_web_hooks"]
    let button_arr = [];
    template_type = template["type"]
    if (template_type == "interactive") {
        action_type = template[template_type]["type"]
        if (action_type == "button") {
            buttons_arr = template[template_type]["action"]["buttons"]
            for (let i = 0; i < buttons_arr.length; i++) {
                button_id = buttons_arr[i]["reply"]["id"]
                button_title = buttons_arr[i]["reply"]["title"]
                _hook_data = "{}"
                if (button_web_hooks_obj.hasOwnProperty(button_id)) {
                    _hook_data = button_web_hooks_obj[button_id]
                }

                data = {}
                data['template_id'] = template_id;
                data['action_id'] = button_id;
                data['action_name'] = button_title;
                data['org_id'] = org_id
                data['web_hooks'] = JSON.stringify(_hook_data);
                await db.TemplateAction.create(data)
            }

        }
        if (action_type == "list") {
            buttons_arr = template[template_type]["action"]["sections"][0]["rows"]
            for (let i = 0; i < buttons_arr.length; i++) {
                button_id = buttons_arr[i]["id"]
                button_title = buttons_arr[i]["title"]
                button_description = '';
                if (buttons_arr[i].hasOwnProperty('description')) {
                    button_description = buttons_arr[i]["description"]
                }

                _hook_data = "{}"
                if (button_web_hooks_obj.hasOwnProperty(button_id)) {
                    _hook_data = button_web_hooks_obj[button_id]
                }

                data = {}
                data['template_id'] = template_id;
                data['action_id'] = button_id;
                data['action_name'] = button_title;
                data['org_id'] = org_id
                data['action_description'] = button_description
                data['web_hooks'] = JSON.stringify(_hook_data)
                await db.TemplateAction.create(data)
            }

        }

    }
}

async function get_template_buttons(template, org_id) {
    let button_arr = [];
    template_type = template["type"]
    if (template_type == "interactive") {
        let buttons_arr;
        action_type = template[template_type]["type"]
        if (action_type == "button") {
            buttons_arr = template[template_type]["action"]["buttons"]
            for (let i = 0; i < buttons_arr.length; i++) {
                button_id = buttons_arr[i]["reply"]["id"]
                button_arr.push(button_id);
            }
        }
        if (action_type == "list") {
            buttons_arr = template[template_type]["action"]["sections"][0]["rows"]
            for (let i = 0; i < buttons_arr.length; i++) {
                button_id = buttons_arr[i]["id"]
                button_arr.push(button_id);
            }

        }
        let template_act = await db.TemplateAction.findAll({ where: { action_id: button_arr, org_id: org_id } });
        return template_act.length > 0 ? false : true;
    } else {
        return true;
    }
}

exports.userDetailsListData = async (params, org_id, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        params = params.data;
        var inner_params = {};
        let org_hash = {};
        let required = false;
        if (params.id) {
            inner_params["id"] = params.id;
        }
        if (org_id) {
            required = true;
            inner_params["org_id"] = org_id;
        }
        if (params.filter) {
            if (Object.keys(params.filter).length > 0) {
                let filterKeys = Object.keys(params.filter);
                let userDetailsData = db.Template.rawAttributes;
                userDetailsData = Object.keys(userDetailsData);
                filterKeys.forEach(filterKey => {
                    if (userDetailsData.includes(filterKey)) {
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
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: [
                {
                    required: required,
                    where: org_hash,
                    attributes: { exclude: ['created_by', 'createdAt', 'updatedAt'] },
                    model: db.Organisation,
                    //as: "TemplatesOrgRelation",
                },
                // {
                //     required: required,
                //     attributes: { exclude: ['created_by', 'createdAt', 'updatedAt'] },
                //     model: db.VersionControl,
                //     as: "TemplatesVersionRelation"
                // }
            ]
        }
        if (params.filter && params.filter.hasOwnProperty('offset') && params.filter.hasOwnProperty('limit')) {
            let offset = typeof params.filter.offset == 'string' ? parseInt(params.filter.offset) : params.filter.offset;
            let limit = typeof params.filter.limit == 'string' ? parseInt(params.filter.limit) : params.filter.limit;
            findAllData["offset"] = offset;
            findAllData["limit"] = limit;
        }
        let result = await db.Template.findAll(findAllData);
        if (!params.filter || (params.filter && (!params.filter.total || parseInt(params.filter.total) == 0))) {
            delete findAllData.offset;
            delete findAllData.limit;
            let count = await db.Template.findAll(findAllData);
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

exports.userDetailsUpdateData = async (params, userId, org_id, next) => {
    logger.info("*** Starting %s of %s ***", getName().functionName, getName().fileName);
    try {
        let id = params.id;
        params = params.data;
        let dataExist = await db.Template.findOne({ where: { id: id } });
        let templateExist = await db.Template.findOne({ where: { template_name: params.template_name, org_id: org_id, id: { [Op.ne]: id } } });
        if (dataExist != null) {
            if (!templateExist) {
                let data = {
                    "template_name": params.template_name,
                    "template_type": params.template_type,
                    "template": params.template,
                    "org_id": org_id,
                    "created_by": userId
                }
                //await db.Template.destroy({ where: { id: id } });
                let results = await db.Template.update(data, { where: { id: id } });
                if (results[0] == 0) {
                    logger.error("*** Error in %s of %s ***", getName().functionName, getName().fileName);
                    return ({ "message": "Update Can Not Be Performed", "success": false, "status": 405 })
                } else {
                    let button_arr = [];
                    let template = JSON.parse(params.template);
                    let template_type = template.template["type"];
                    if (template_type == "interactive") {
                        /*let buttons_arr;
                        action_type = template[template_type]["type"]
                        if (action_type == "button") {
                            buttons_arr = template[template_type]["action"]["buttons"]
                            for (let i = 0; i < buttons_arr.length; i++) {
                                button_id = buttons_arr[i]["reply"]["id"]
                                button_arr.push(button_id);
                            }
                        }
                        if (action_type == "list") {
                            buttons_arr = template[template_type]["action"]["sections"][0]["rows"]
                            for (let i = 0; i < buttons_arr.length; i++) {
                                button_id = buttons_arr[i]["id"]
                                button_arr.push(button_id);
                            }
    
                        }*/
                        await db.TemplateAction.destroy({ where: { org_id: org_id, template_id: id } });
                        //await db.TemplateMapping.destroy({ where: { action_id: button_arr } });
                        await create_template_actions(template, id, org_id);
                    }

                    logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
                    return { success: true, data: {} }
                }
            } else {
                logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
                return { success: false, message: 'Template already exist', status: 409 };
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

exports.userDetailsDeleteData = async (params) => {
    logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
    try {
        var id = params.data.id;
        var _arr = [];
        var count = 0;
        for (var i = 0; i < id.length; i++) {
            var dataExists = await db.Template.findOne({
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
                var result = await db.Template.destroy({
                    where: { id: id[i] }
                });
                await db.TemplateMapping.destroy({ where: { target_message_id: dataExists.message_id } });
                await db.TemplateAction.destroy({ where: { template_id: dataExists.id } });
                if (result > 0) {
                    var _hash = { "success": true };
                    _hash["data"] = { "id": id[i] };
                    _hash["message"] = `Template deleted successfully`;
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