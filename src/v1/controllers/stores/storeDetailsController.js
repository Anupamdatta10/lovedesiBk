const {
    validateStoreDetailsCreate, 
    formatResponseStoreDetailsCreateData, 
    validateStoreDetailsListData, 
    formatResponseStoreDetailsListData, 
    validateStoreDetailsUpdateData, 
    formatResponseStoreDetailsUpdateData, 
    validateStoreDetailsDelete, 
    formatResponseStoreDetailsDeleteData
} = require("../../helpers/store/storeDetailsHelper")
const {
    StoreDetailsData, 
    StoreDetailsListData, 
    StoreDetailsUpdateData,
    StoreDetailsDeleteData
} = require("../../models/queryModels/stores/storeDetails");
const logger = require('../../../logger/logger');
const { getName } = require('../../../logger/logFunctionName');




exports.storeDetailsCreateController = async (req, res, next) => {
    logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
    try {
        const currentCognitoUserDetails = req.currentUser;
        let userParams = JSON.parse(currentCognitoUserDetails['custom:user_details']);
        let currentUserId = userParams.user_id;
        let data = req.body;
        let org_id = userParams.org_id;
        let isArray = Array.isArray(data);
        if (isArray) {
            if (data.length > 0) {
                let responseArr = [];
                data.forEach(async reqData => {
                    
                    const validData = validateStoreDetailsCreate(reqData, next);
                    logger.info("%s validparams got success response true: %s", getName().functionName, JSON.stringify(validData));
                    if (validData.success) {
                        let StoreDetails = await StoreDetailsData(validData, currentUserId,org_id, next);
                        if (StoreDetails) {
                            let responseData = formatResponseStoreDetailsCreateData(StoreDetails);
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

exports.storeDetailsListController = async (req, res, next) => {
    logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
    try {
        const currentCognitoUserDetails = req.currentUser;
        let userParams = JSON.parse(currentCognitoUserDetails['custom:user_details']);
        let currentUserId = userParams.user_id;
        let org_id=userParams.org_id;
        const validDatas = await validateStoreDetailsListData(req, next);
        logger.info("%s validparams got success response true: %s", getName().functionName, JSON.stringify(validDatas));
        if (validDatas.success) {
            let StoreDetailsData = await StoreDetailsListData(validDatas,org_id, next);
            if (StoreDetailsData) {
                let responseData = await formatResponseStoreDetailsListData(StoreDetailsData);
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

exports.storeDetailsUpdateController = async (req, res, next) => {
    logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
    try {
        let currentCognitoUserDetails = req.currentUser;
        let userParams = JSON.parse(currentCognitoUserDetails['custom:user_details']);
        let user_id = userParams.user_id;
        let org_id = userParams.org_id;
        const validDatas = validateStoreDetailsUpdateData(req, next);
        logger.info("%s validparams got success response true: %s", getName().functionName, JSON.stringify(validDatas));
        if (validDatas.success) {
            let StoreDetailsData = await StoreDetailsUpdateData(validDatas, user_id, org_id, next);
            if (StoreDetailsData) {
                let responseData = formatResponseStoreDetailsUpdateData(StoreDetailsData);
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

exports.storeDetailsDeleteController = async (req, res, next) => {
    try {
        logger.info("* Starting %s of %s *", getName().functionName, getName().fileName);
        // check if params are present
        const validDatas = validateStoreDetailsDelete(req, next);
        logger.info("%s validparams got success response true: %s", getName().functionName, JSON.stringify(validDatas));
        if (validDatas) {
            let Data = await StoreDetailsDeleteData(validDatas, next);
           
            if (Data) {
                let responseData = formatResponseStoreDetailsDeleteData(Data);
               
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
        }
    } catch (err) {
        logger.error(`${err.message || JSON.stringify(err)} in %s of %s`, getName().functionName, getName().fileName);
        next({ message: "Something went wrong" });
        return;
    }
}