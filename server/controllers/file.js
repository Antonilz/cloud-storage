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
    const newFile = new File(file);
    const savedFile = await newFile.save();
    res.status(httpStatus.CREATED);
    const fileURL = await savedFile.getDownloadLink();
    return res.json({
      type: 'file',
      data: {
        ...savedFile.transform(),
        inlineURL: fileURL.inlineURL,
        attachmentURL: fileURL.attachmentURL
      }
    });
  } catch (error) {
    console.log(error);
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
    console.log(e);
    return res.sendStatus(404);
  }
};
