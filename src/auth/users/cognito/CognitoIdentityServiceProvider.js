const AWS = require("aws-sdk");
const EV = require('../../../environment');

const auth = {
    region: EV.REGION,
    accessKeyId: EV.ACCESS_KEY_ID,
    secretAccessKey: EV.SECRECT_ACCESS_KEY
};

const CognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider(auth);

module.exports = CognitoIdentityServiceProvider;