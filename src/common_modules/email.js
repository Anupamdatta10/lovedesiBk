const nodemailer = require('nodemailer');
const ENV = process.env;
// const aws = require('@aws-sdk/client-ses')
// let { defaultProvider } = require("@aws-sdk/credential-provider-node");
let AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const Handlebars = require('hbs');
/**
 * 
 * @param {*} from string email@example.com
 * @param {*} to string/ string,string email@example.com / User Name <email@example.com>
 * @param {*} subject string "Mail Subject" 
 * @param {*} text string "Mail Body"
 * @param {*} cc array [email@example.com / User Name <email@example.com>]
 * @param {*} bcc array [email@example.com / User Name <email@example.com>]
 * @param {*} attachments array [{   // filename and content type is derived from path 
            path: '/path/to/file.txt'
        }] https://nodemailer.com/message/attachments/
 * https://nodemailer.com/
 * @returns 
 */

 sendEmail =  (from, to, subject, body, text, cc, bcc, attachments) =>{
    //console.log(from, to, subject, text)
    from = from || ENV.ENV_DEFAULT_MAIL_FROM;
    text = text || "";
    cc = cc || [];
    bcc = bcc || [];
    attachments = attachments || [];
    var transporter;
    if(ENV.ENV_MAIL_SERVICE == "SMTP"){
        const mailConfig = {
            host: ENV.ENV_SMTP_ENDPOINT,
            port: ENV.ENV_SMTP_PORT, //HTTP: 25, 587 or 2587 HTTPS: 465 or 2465
            secure:(ENV.ENV_SMTP_PORT == 465 || ENV.ENV_SMTP_PORT == 2465) ? true : false, // true for 465, false for other ports
            authMethod:"login",
            auth: {
                user: ENV.SMTP_AUTH_USERNAME,
                pass: ENV.ENV_SMTP_AUTH_PASS
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false,
            }
        };
        transporter = nodemailer.createTransport(mailConfig)
    }
    else if(ENV.ENV_MAIL_SERVICE == "SES"){
        // configure AWS SDK
        AWS.config.update({
            accessKeyId: ENV.ACCESS_KEY_ID,
            secretAccessKey: ENV.SECRECT_ACCESS_KEY,
            region: ENV.REGION,
        });

        // create Nodemailer SES transporter
        transporter = nodemailer.createTransport({
            SES: new AWS.SES({
                apiVersion: '2010-12-01'
            })
        });
    }
    var mailOptions = {
        from:from,
        to: to,
        subject:subject,
        html:body
    }
    if(text){
        mailOptions['text'] = text;
    }
    if(cc.length > 0){
        mailOptions['cc'] = cc;
    }
    if(bcc.length > 0){
        mailOptions['bcc'] = bcc;
    }
    if(attachments.length > 0){
        mailOptions['attachments'] = attachments;
    }
    if(ENV.ENV_MAIL_SERVICE == "SES"){
        mailOptions['ses']= {
            // optional extra arguments for SendRawEmail
            Tags: [
            ],
        }
    }
    return transporter.sendMail(mailOptions);
}
/**
 * @param template html file name
 * @param data object {"name":"some name"} 
 */
prepareTemplate = async (template, data)=>{
    data = data || {};
    let templatePath = path.join(__dirname, "../", "email_templates/"+template);
    //console.log(templatePath)
    let source = fs.readFileSync(templatePath,{encoding:'utf-8'});
    let templateHbs = Handlebars.compile(source);
    return templateHbs(data);
}
snsPublish = (param)=>{
    return new Promise((resolve, reject)=>{
        // Set region
        AWS.config.update({
            accessKeyId: ENV.ACCESS_KEY_ID,
            secretAccessKey: ENV.SECRECT_ACCESS_KEY,
            region: ENV.REGION,
        });

        // Create publish parameters
        var params = {
            Message: param.message, /* required */
            TopicArn: ENV.TOPIC_ARN
        };

        // Create promise and SNS service object
        var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

        // Handle promise's fulfilled/rejected states
        publishTextPromise.then((data)=> {
            console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
            console.log("MessageID is " + data.MessageId);
            resolve(data)
        }).catch((err)=> {
            console.error(err, err.stack);
            reject(err);
        });
    })
}
module.exports = {sendEmail, prepareTemplate, snsPublish}
