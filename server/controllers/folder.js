const httpStatus = require('http-status');
const { omit } = require('lodash');
const Folder = require('../models/Folder');
const File = require('../models/File');

/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const folder = await Folder.get(id);
    req.locals = { folder };
    return next();
  } catch (error) {
    res.status(404).json(error);
  }
};

/**
 * Get children folders and files for the following folder
 * @public
 */
exports.get = async (req, res, next) => {
  const pathSlug = req.params[0].trim();
  //Folder.getUpGoingFolderStructure(pathSlug);
  let rootFolder = false;
  if (pathSlug != null && pathSlug != '') {
    rootFolder = await Folder.find({
      pathSlug
    }).limit(1);
    if (rootFolder[0] == null) {
      return res.sendStatus(404);
    } else {
      rootFolder = rootFolder[0];
    }
  }
  const [childrenFolders, childrenFiles] = await Promise.all([
    Folder.getChildrenNodes(rootFolder ? rootFolder._id : null),
    File.getChildrenNodes(rootFolder ? rootFolder._id : null)
  ]);
  /*const filesURLs = await Promise.all(
    childrenFiles.map(async file => await file.getDownloadLink())
  );*/

  return res.json({
    children: [
      ...childrenFiles.map((file, index) => {
        return {
          type: 'file',
          data: file
        };
      }),
      ...childrenFolders.map(folder => {
        return { type: 'folder', data: folder };
      })
    ],
    currentFolder: rootFolder
      ? rootFolder.transform()
      : {
          name: '',
          path: '',
          pathSlug: ''
        }
  });
};

/**
 * Create new folder
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
    const folderData = {
      ...req.body,
      parentID: parentFolder ? parentFolder._id : null
    };
    const folder = new Folder(folderData);
    const savedFolder = await folder.save();
    res
      .status(httpStatus.CREATED)
      .json({ type: 'folder', data: savedFolder.transform() });
  } catch (error) {
    next(Folder.checkDuplicateFolder(error));
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
  Object.assign(folder, req.body);
  folder
    .save()
    .then(savedFolder => res.json(savedFolder.transform()))
    .catch(e => next(Folder.checkDuplicateFolder(e)));
};
