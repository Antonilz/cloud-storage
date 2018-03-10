const httpStatus = require('http-status');
const { omit } = require('lodash');
const Folder = require('../models/Folder');
const File = require('../models/File');
const { handler: errorHandler } = require('../middlewares/error');

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
    return errorHandler(error, req, res);
  }
};

/**
 * Get children folders and files for the following folder
 * @public
 */
exports.get = async (req, res, next) => {
  console.time('get current folder children');
  const pathSlug = req.params[0].trim();
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

  let [childrenFolders, childrenFiles] = await Promise.all([
    Folder.getChildrenNodes(rootFolder ? rootFolder._id : null),
    File.getChildrenNodes(rootFolder ? rootFolder._id : null)
  ]);

  childrenFolders = childrenFolders.map(folder => {
    return { type: 'folder', data: folder.transform() };
  });

  const filesURLs = await Promise.all(
    childrenFiles.map(file => file.getDownloadLink())
  );

  childrenFiles = childrenFiles.map((file, index) => {
    return {
      type: 'file',
      data: { ...file.transform(), url: filesURLs[index] }
    };
  });

  const children = [...childrenFolders, ...childrenFiles];
  console.timeEnd('get current folder children');
  return res.json({
    children: children,
    currentFolder: rootFolder
      ? rootFolder.transform()
      : {
          name: '',
          path: ''
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
    res.status(httpStatus.CREATED);
    res.json({ type: 'folder', data: savedFolder.transform() });
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
  const folder2 = Object.assign(folder, req.body);
  folder
    .save()
    .then(savedFolder => res.json(savedFolder.transform()))
    .catch(e => next(Folder.checkDuplicateFolder(e)));
};
