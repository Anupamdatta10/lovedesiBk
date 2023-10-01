const logger = require('../logger/logger');
const { getName } = require('../logger/logFunctionName');

const EV = require('../environment/index')
const AWS = require('aws-sdk');


const s3bucket = new AWS.S3({
  accessKeyId: EV.ACCESS_KEY_ID,
  secretAccessKey: EV.SECRECT_ACCESS_KEY,
  Bucket: EV.BUCKET
});
function uploadToS3(buffer_str, root_folder_name, file_path, content_type) {
  return new Promise((resolve, reject) => {
    const bucketName = {
      Bucket: EV.BUCKET
    }
    s3bucket.createBucket(bucketName, function (error1, data1) {
      if (error1 && error1.statusCode == 409) {
        console.log("Bucket has been created already");
      } else {
        console.log('Bucket Created Successfully')
      }
    })
    const params = {
      Bucket: EV.BUCKET,
      Key: '' + root_folder_name + '/' + file_path + '',
      Body: buffer_str,
      //ContentEncoding: 'base64',
      ContentType: content_type ? content_type : "application/octet-stream"
    };
    s3bucket.upload(params, function (error2, data2) {
      if (error2) {
        console.log('error occur while uploading file');
        reject(error2);
      } else {
        resolve(data2.Location);
      }
    });
  })
}
function deleteFromS3(need_to_delete_object) {
  return new Promise((resolve, reject) => {
    params = {
      Bucket: EV.BUCKET,
      Delete: {
        Objects: need_to_delete_object,
        Quiet: true
      }
    };
    s3bucket.deleteObjects(params, function (error, data) {
      if (error) {
        console.log(error, error.stack);
      }
      else {
        resolve(data)
        console.log('deleted successfully', data);
      }
    });
  })
}

module.exports = { uploadToS3, deleteFromS3 }
