const httpStatus = require('http-status');
const { omit } = require('lodash');
const aws = require('aws-sdk');
const Minio = require('minio');
const Folder = require('../models/Folder');
const File = require('../models/File');
const { handler: errorHandler } = require('../middlewares/error');
const keys = require('../config/keys');

/**
 * Get folder
 * @public
 */
exports.get = async (req, res) => {
  const path = req.params[0].trim();
  if (path != null && path != '') {
    let rootFolder = await Folder.find({
      path: path
    }).limit(1);
    if (rootFolder[0] == null) {
      return res.sendStatus(404);
    } else {
      rootFolder = rootFolder[0];
    }

    let children = await Folder.getChildrenNodes(rootFolder._id);
    children = children.map(child => child.transform());
    rootFolder = rootFolder.transform();
    console.timeEnd('test');
    return res.json({ children: children, currentFolder: rootFolder });
  } else {
    let children = await Folder.getChildrenNodes(null);
    children = children.map(child => child.transform());
    console.timeEnd('test');
    return res.json({ children: children, currentFolder: '' });
  }
};

/**
 * Update existing folder
 * @public
 */
exports.update = async (req, res, next) => {
  const parentPath = req.params[0].trim();
  let parentFolder = null;
  if (parentPath != null && parentPath != '') {
    parentFolder = await Folder.findOne(
      {
        path: parentPath
      },
      { _id: 1 }
    );
  }
  const folder = await Folder.get(parentFolder._id);
  const folder2 = Object.assign(folder, req.body);
  folder
    .save()
    .then(savedFolder => res.json(savedFolder.transform()))
    .catch(e => next(Folder.checkDuplicateFolder(e)));
};

/**
 * Delete items (folders/files)
 * @public
 */
exports.delete = async (req, res, next) => {
  const items = req.body.items;
  const minioClient = new Minio.Client({
    //endPoint: 'play.minio.io',
    endPoint: '127.0.0.1',
    port: 10000,
    secure: true,
    accessKey: keys.storageAccessKey,
    secretKey: keys.storageSecretAccessKey
  });
  items.forEach(async item => {
    if (item.type === 'file') {
      const file = await File.get(item.data.id);

      aws.config.region = 'eu-central-1';
      const s3 = new aws.S3({
        signatureVersion: 'v4',
        //endpoint: 'https://play.minio.io:9000',
        endpoint: 'https://127.0.0.1:10000',
        sslEnabled: false,
        s3ForcePathStyle: true,
        accessKeyId: keys.storageAccessKey,
        secretAccessKey: keys.storageSecretAccessKey
      });

      const params = {
        Bucket: keys.bucketName,
        Key: file.uuid
      };
      console.log(keys.bucketName);
      minioClient.removeObject(params.Bucket, params.Key, async (err, data) => {
        if (err) {
          console.log(err);
          return res.status(500, 'Cannot delete items');
        } else {
          const deleteFile = await file.remove();
        }
      });
    } else if (item.type === 'folder') {
      const IDsToDelete = await Folder.getDescendants(item.data.id);
      const removedFiles = await File.remove(
        { parentID: { $in: IDsToDelete } },
        (err, result) => {
          if (err) {
            return res.sendStatus(404);
          }
        }
      );
      const removedFolders = await Folder.remove(
        { _id: { $in: IDsToDelete } },
        (err, result) => {
          if (err) {
            return res.sendStatus(404);
          }
        }
      );
    }
    return res.sendStatus(200);
  });
};

/**
 * Update existing folder
 * @public
 */
exports.search = async (req, res, next) => {
  console.time('get all items by query input');
  const queryInput = req.params[0].trim();
  let [foundFolders, foundFiles] = await Promise.all([
    Folder.getFoldersByName(queryInput),
    File.getFilesByName(queryInput)
  ]);

  foundFolders = foundFolders.map(folder => {
    return { type: 'folder', data: folder.transform() };
  });

  //TODO speed up
  const filesURLs = await Promise.all(
    foundFiles.map(file => file.getDownloadLink())
  );

  foundFiles = foundFiles.map((file, index) => {
    return {
      type: 'file',
      data: { ...file.transform(), url: filesURLs[index] }
    };
  });

  const children = [...foundFolders, ...foundFiles];
  console.timeEnd('get all items by query input');
  return res.json({ results: children });
};
