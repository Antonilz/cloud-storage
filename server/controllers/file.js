const Folder = require('../models/Folder');
const File = require('../models/File');
const httpStatus = require('http-status');

/**
 * Create new file
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const { pathSlug, fileData } = req.body;
    let parentFolder = null;
    if (pathSlug != null && pathSlug != '') {
      parentFolder = await Folder.findOne(
        {
          pathSlug
        },
        { _id: 1 }
      );
    }
    const file = {
      ...fileData,
      pathSlug: pathSlug ? pathSlug : '',
      parentID: parentFolder ? parentFolder._id : null
    };
    const newFile = await new File(file).save();
    const fileURL = await newFile.getDownloadLink();
    return res.status(httpStatus.CREATED).json({
      type: 'file',
      preview: fileURL.previewURL,
      data: {
        ...newFile.transform(),
        inlineURL: fileURL.inlineURL,
        attachmentURL: fileURL.attachmentURL
      }
    });
  } catch (error) {
    next(File.checkDuplicateFile(error));
  }
};

exports.getDownloadURLs = async (req, res, next) => {
  const { ids } = req.body;

  try {
    const files = await File.find({ _id: { $in: ids } });
    const filesURLs = await Promise.all(
      files.map(async file => await file.getDownloadLink())
    );
    return res.json(
      files.map((file, index) => {
        return {
          id: file.id,
          inlineURL: filesURLs[index].inlineURL,
          attachmentURL: filesURLs[index].attachmentURL
        };
      })
    );
  } catch (e) {
    return res.sendStatus(404);
  }
};

exports.getUploadURL = async (req, res) => {
  const filename = req.query.objectName;
  const folderPath = req.query.folder;
  const mimeType = req.query.contentType;
  //const fileKey = uuidv4(filename); // create unique name
  const fileKey = `${folderPath === '' ? '' : folderPath + '/'}${filename}`;
  try {
    console.log('1');
    const presignedURL = await File.getUploadLink({
      objectName: fileKey,
      expiryTime: 24 * 60 * 60
    });
    return res.json({
      signedUrl: presignedURL,
      filename: filename,
      fileKey: fileKey
    });
  } catch (error) {
    console.log(error);
  }
};
