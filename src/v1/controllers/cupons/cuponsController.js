const {
    validateCuponsCreate, 
    formatResponseCuponsCreateData, 
    validateCuponsListData, 
    formatResponeCuponsListData, 
    validateCuponsUpdateData, 
    formatResponseCuponsUpdateData, 
    validateCuponsDelete, 
    formatResponseCuponsDeleteData
} = require("../../helpers/cupons/cuponsHelper")
const {
    cuponsData, 
    cuponsListData, 
    cuponsUpdateData,
    cuponsDeleteData
} = require("../../models/queryModels/cupon/cupon");
const logger = require('../../../logger/logger');
const { getName } = require('../../../logger/logFunctionName');




exports.cuponsCreateController = async (req, res, next) => {
    logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
    try {
        // const currentCognitoUserDetails = req.currentUser;
        // let userParams = JSON.parse(currentCognitoUserDetails['custom:user_details']);
        // let currentUserId = userParams.user_id;
        let data = req.body;
        // let org_id = userParams.org_id;
        let isArray = Array.isArray(data);
        if (isArray) {
            if (data.length > 0) {
                let responseArr = [];
                data.forEach(async reqData => {
                    
                    const validData = validateCuponsCreate(reqData, next);
                    logger.info("%s validparams got success response true: %s", getName().functionName, JSON.stringify(validData));
                    if (validData.success) {
                        let cupons = await cuponsData(validData, next);
                        if (cupons) {
                            let responseData = formatResponseCuponsCreateData(cupons);
                            if (responseData.success == true) {
                                var responseTrue = {
                                    "success": responseData.success,
                                    "message": responseData.message,
                                    "data": responseData.data
                                }
                                responseArr.push(responseTrue);
                                if (responseArr.length == data.length) {
                                    logger.info("*** Ending %s of %s ***", getName().functionName, getName().fileName);
                                    res.send(responseArr);
                                }
                            } else if (responseData.success == false) {
                                var responseFalse = {
                                    "success": responseData.success,
                                    "message": responseData.message,
                                    "status": responseData.status,
                                }
                                responseArr.push(responseFalse);
                                if (responseArr.length == data.length) {
                                    logger.error("*** error %s of %s ***", getName().functionName, getName().fileName);
                                    res.status(responseData.status).send(responseArr);
                                }
                            }
                        }
                    } else {
                        var responseFalse = {
                            "success": validData.success,
                            "status": validData.status,
                            "message": validData.message
                        }
                        responseArr.push(responseFalse);
                        if (responseArr.length == data.length) {
                            logger.error("*** error %s of %s ***", getName().functionName, getName().fileName);
                            res.status(validData.status).send(responseArr);
                        }
                    }
                })
            } else {
                logger.error("No data avaliable in %s of %s ", getName().functionName, getName().fileName);
                next({ "status": 404, "success": false, "message": "No data avaliable" })
            }
        } else {
            logger.error("Provided data format is not proper in %s of %s ", getName().functionName, getName().fileName);
            next({ "status": 400, "success": false, "message": "provided data is not proper" })
        }
    } catch (err) {
        logger.error(`${err.message || JSON.stringify(err)} in %s of %s`, getName().functionName, getName().fileName);
        next({ message: "Something went wrong" });
        return;
    }
}

exports.cuponsListController = async (req, res, next) => {
    logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
    try {
        // const currentCognitoUserDetails = req.currentUser;
        // let userParams = JSON.parse(currentCognitoUserDetails['custom:user_details']);
        // let currentUserId = userParams.user_id;
        // let org_id=userParams.org_id;
        const validDatas = await validateCuponsListData(req, next);
        logger.info("%s validparams got success response true: %s", getName().functionName, JSON.stringify(validDatas));
        if (validDatas.success) {
            let CuponsData = await cuponsListData(validDatas, next);
            if (CuponsData) {
                let responseData = await formatResponeCuponsListData(CuponsData);
                if (responseData.success) {
                    var response = {
                        "success": responseData.success,
                        "total": responseData.total,
                        "data": responseData.data
                    }
                    logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
                    res.json(response);
                }
            }
        }
    } catch (error) {
        logger.error(`${error.message || JSON.stringify(error)} in %s of %s`, getName().functionName, getName().fileName);
        next({ message: "Something went wrong" });
        return;
    }
}

exports.cuponsUpdateController = async (req, res, next) => {
    logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
    try {
        // let currentCognitoUserDetails = req.currentUser;
        // let userParams = JSON.parse(currentCognitoUserDetails['custom:user_details']);
        // let user_id = userParams.user_id;
        // let org_id = userParams.org_id;
        const validDatas = validateCuponsUpdateData(req, next);
        logger.info("%s validparams got success response true: %s", getName().functionName, JSON.stringify(validDatas));
        if (validDatas.success) {
            let CuponsData = await cuponsUpdateData(validDatas, next);
            if (CuponsData) {
                let responseData = formatResponseCuponsUpdateData(CuponsData);
                if (responseData.success) {
                    var response = {
                        "success": responseData.success,
                        "total": responseData.total,
                        "data": responseData.data,
                        "message": responseData.message
                    }
                    logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
                    res.json(response);
                } else {
                    var response = {
                        "success": responseData.success,
                        "message": responseData.message,
                        "status": responseData.status
                    }
                    logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
                    res.status(responseData.status).json(response);
                }
            }
        } else {
            logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
            let responce = {
                "success": validDatas.success,
                "message": validDatas.message
            }
            res.status(validDatas.status).json(responce);
        }
    } catch (error) {
        logger.error(`${error.message || JSON.stringify(error)} in %s of %s`, getName().functionName, getName().fileName);
        next({ message: "Something went wrong" });
        return;
    }

}

exports.cuponsDeleteController = async (req, res, next) => {
    try {
        logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
        // check if params are present
        const validDatas = validateCuponsDelete(req, next);
        logger.info("%s validparams got success response true: %s", getName().functionName, JSON.stringify(validDatas));
        if (validDatas.success) {
            let Data = await cuponsDeleteData(validDatas, next);
           
            if (Data) {
                let responseData = formatResponseCuponsDeleteData(Data);
               
                if (responseData.success) {
                    var response = {
                        "success": responseData.success,
                        "message": responseData.message,
                        "data": responseData.data
                    }
                    logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
                    res.send(response);
                }else{
                   
                    var response = {
                        "success": responseData.success,
                        "message": responseData.message,
                        "data": responseData.data
                    }
                    logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
                    res.status(responseData.data[0].status).send(response);
                }
            }
        }else{
            logger.info("* Ending %s of %s *", getName().functionName, getName().fileName);
            let responce = {
                "success": validDatas.success,
                "message": validDatas.message
            }
            res.status(validDatas.status).json(responce);
        }
    } catch (err) {
        logger.error(`${err.message || JSON.stringify(err)} in %s of %s`, getName().functionName, getName().fileName);
        next({ message: "Something went wrong" });
        return;
    }
}