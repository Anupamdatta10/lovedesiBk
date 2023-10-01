var base64Img = require('base64-img');
const AWS = require('aws-sdk')
const EV = require('../../src/environment');
const sharp = require('sharp');

const s3bucket = new AWS.S3({
    accessKeyId: EV.ACCESS_KEY_ID,
    secretAccessKey: EV.SECRECT_ACCESS_KEY,
    Bucket: EV.BUCKET
  });

function stringToBase64(url) {
    return new Promise((resolve,reject) => {
        base64Img.requestBase64(url,(err, res, body) => {
            if (err) console.log(err)
            else { 
                resolve(body);
            }
        });
    })
}

getS3Object=async (url,sizeWidth,sizeHeight)=>{
    
    let urlSplitObj = url.split('/');
    let urlKey = urlSplitObj.slice(3).join('/')
    // let urlSplitObjLen = urlSplitObj.length;
    // let imageName = decodeURI(urlSplitObj[urlSplitObjLen-1]);
    // let folderName = decodeURI(urlSplitObj.slice(urlSplitObjLen-2,urlSplitObjLen));
  
    return new Promise((resolve,reject) => {
            const params = {
            Bucket: EV.BUCKET,
            Key: decodeURI(urlKey) // '' + folderName + '/' + imageName + ''
            }
            
            s3bucket.getObject(params,async (err, data)=> {
            if (err) {
                console.log("Error", err);
                //resolve({"success": false, "message": err.message || JSON.stringify(err)})
            } else {
                if(sizeWidth>0 && sizeHeight>0){
                    const compressedImageBuffer = await sharp(data.Body)
                    .resize({ 
                        width: sizeWidth, 
                        height: sizeHeight, 
                        fit: 'cover'
                    })
                    .toBuffer();
                    resolve('data:application/octet-stream;base64,'+compressedImageBuffer.toString('base64'));
                }else{
                    resolve(`data:${data.ContentType};base64,`+data.Body.toString('base64'));
                }
            }
        })
    });
}


 module.exports = {stringToBase64, getS3Object}
