const aws = require('aws-sdk');
const contentDisposition = require('content-disposition');
const uuidv4 = require('uuid/v4');
const keys = require('../config/keys');
const Minio = require('minio');

function checkTrailingSlash(path) {
  if (path && path[path.length - 1] != '/') {
    path += '/';
  }
  return path;
}

/**
 * Returns an object with `signedUrl` and `publicUrl` properties that
 * give temporary access to PUT an object in an S3 bucket.
 */
exports.getSignedDownloadLink = async (req, res) => {
  const filename = req.params.id;
  const fileKey = checkTrailingSlash('') + filename;

  const minioClient = new Minio.Client({
    endPoint: 'play.minio.io',
    port: 9000,
    secure: true,
    accessKey: keys.storageAccessKey,
    secretKey: keys.storageSecretAccessKey
  });

  const params = {
    bucketName: keys.bucketName,
    objectName: filename
  };
  minioClient.presignedPutObject(params, function(err, presignedUrl) {
    if (err) return console.log(err);
    res.json({
      signedUrl: presignedUrl,
      filename: filename,
      fileKey: fileKey
    });
  });

  /*
    aws.config.region = 'eu-central-1';
    aws.config.accessKeyId = keys.storageAccessKey;
    aws.config.secretAccessKey = keys.storageSecretAccessKey;
    const s3 = new aws.S3({
        signatureVersion: 'v4'
    });
    const params = {
        Bucket: 'mpei-fs',
        Key: filename,
        ResponseContentDisposition: contentDisposition(filename)
    };
    s3.getSignedUrl('getObject', params, function(err, data) {
        if (err) {
            return res.status(500, 'Cannot create S3 signed URL');
        }
        res.json({
            signedUrl: data,
            filename: filename,
            fileKey: fileKey
        });
    });*/
};

/**
 * Returns an object with `signedUrl` and `publicUrl` properties that
 * give temporary access to PUT an object in an S3 bucket.
 */
exports.getSignedUploadLink = async (req, res) => {
  const filename = req.query.objectName;
  const mimeType = req.query.contentType;
  const fileKey = uuidv4(filename); // create unique name

  /*const s3 = new aws.S3({
        signatureVersion: 'v4',
        region: 'us-east-1',
        s3ForcePathStyle: true,
        sslEnabled: false,
        accessKeyId: keys.storageAccessKey,
        secretAccessKey: keys.storageSecretAccessKey,
        endpoint: keys.endpoint
    });
    const params = {
        Bucket: 'mpei',
        Key: fileKey,
        Expires: 60,
        ContentType: mimeType || 'text/plain',
        ACL: 'private'
    };

    s3.getSignedUrl('putObject', params, function(err, data) {
        if (err) {
            console.log(err);
            return res.status(500, 'Cannot create S3 signed URL');
        }
        res.json({
            signedUrl: data,
            filename: filename,
            fileKey: fileKey
        });
    });*/

  const minioClient = new Minio.Client({
    endPoint: 'play.minio.io',
    port: 9000,
    secure: true,
    accessKey: keys.storageAccessKey,
    secretKey: keys.storageSecretAccessKey
  });

  const params = {
    bucketName: keys.bucketName,
    objectName: fileKey
  };

  console.log(keys.storageSecretKey);
  minioClient.presignedPutObject(
    params.bucketName,
    params.objectName,
    24 * 60 * 60,
    function(err, presignedUrl) {
      //console.log(presignedUrl);
      if (err) return console.log(err);
      res.json({
        signedUrl: presignedUrl,
        filename: filename,
        fileKey: fileKey
      });
    }
  );
};
