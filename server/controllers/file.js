const Folder = require('../models/Folder');
const File = require('../models/File');
const httpStatus = require('http-status');

/**
 * Create new file
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const parentPath = req.params[0].trim();
    let parentFolder = null;
    if (parentPath != null && parentPath != '') {
      parentFolder = await Folder.findOne(
        {
          pathSlug: parentPath
        },
        { _id: 1 }
      );
    }
    const fileData = {
      ...req.body,
      path: parentPath ? parentPath : '',
      parentID: parentFolder ? parentFolder._id : null
    };
    const file = new File(fileData);
    const savedFile = await file.save();
    res.status(httpStatus.CREATED);
    const fileURL = await savedFile.getDownloadLink();
    res.json({
      type: 'file',
      data: { ...savedFile.transform(), url: fileURL }
    });
  } catch (error) {
    next(File.checkDuplicateFile(error));
  }
};
