const Minio = require('minio');
const aws = require('aws-sdk');
const contentDisposition = require('content-disposition');
const keys = require('../config/keys');

const minioClient = new Minio.Client({
  endPoint: '127.0.0.1', //play.minio.io
  port: 10000, // 9000
  secure: true,
  accessKey: keys.storageAccessKey,
  secretKey: keys.storageSecretAccessKey
});

const s3Client = new aws.S3({
  signatureVersion: 'v4',
  region: 'us-east-1',
  s3ForcePathStyle: true,
  sslEnabled: false,
  accessKeyId: keys.storageAccessKey,
  secretAccessKey: keys.storageSecretAccessKey,
  endpoint: keys.endpoint
});

function getSignedUploadLink({ bucketName, objectName, expiryTime }) {
  return new Promise((resolve, reject) => {
    minioClient.presignedPutObject(
      bucketName,
      objectName,
      expiryTime,
      (err, presignedUrl) => (err ? reject(err) : resolve(presignedUrl))
    );
  });
}

function getSignedDownloadLink({
  bucketName,
  objectName,
  fileName,
  contentDispositionType
}) {
  const params = {
    Bucket: bucketName,
    Key: objectName,
    ResponseContentDisposition: contentDisposition(fileName, {
      type: contentDispositionType
    })
  };
  return new Promise((resolve, reject) => {
    s3Client.getSignedUrl('getObject', params, (err, presignedUrl) => {
      if (err) {
        reject(err);
      } else {
        resolve(presignedUrl);
      }
    });
  });
}

function deleteObject(bucketName, objectName) {
  return new Promise((resolve, reject) => {
    minioClient.removeObject(
      bucketName,
      objectName,
      err => (err ? reject(err) : resolve(true))
    );
  });
}

function getObject(bucketName, objectName) {
  return new Promise((resolve, reject) => {
    minioClient.getObject(bucketName, objectName, (err, dataStream) => {
      if (err) {
        reject(err);
      }
      resolve(dataStream);
    });
  });
}

function putObject(bucketName, objectName, fileStream) {
  return new Promise((resolve, reject) => {
    minioClient.putObject(bucketName, objectName, fileStream, {}, err => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
}

module.exports = {
  getSignedUploadLink,
  getSignedDownloadLink,
  deleteObject,
  getObject,
  putObject
};
