const httpStatus = require('http-status');
const { omit } = require('lodash');
const Folder = require('../models/Folder');
const File = require('../models/File');
const Tag = require('../models/Tag');
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
    return res.json({ children: children, currentFolder: rootFolder });
  } else {
    let children = await Folder.getChildrenNodes(null);
    children = children.map(child => child.transform());
    return res.json({ children: children, currentFolder: '' });
  }
};

/**
 * Delete items (folders/files)
 * @public
 */
exports.delete = async (req, res, next) => {
  const { items } = req.body;
  items.forEach(async item => {
    if (item.type === 'file') {
      const file = await File.get(item.data.id);
      const deleteFile = await file.remove();
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
 * Search items by name
 * @public
 */
exports.search = async (req, res, next) => {
  console.time('get all items by query input');
  const { query } = req.body;
  let [foundFolders, foundFiles] = await Promise.all([
    Folder.getFoldersByName(query),
    File.getFilesByName(query)
  ]);

  foundFolders = foundFolders.map(folder => {
    return { type: 'folder', data: folder.transform() };
  });

  foundFiles = foundFiles.map((file, index) => {
    return {
      type: 'file',
      data: { ...file.transform() }
    };
  });

  const children = [...foundFolders, ...foundFiles];
  console.timeEnd('get all items by query input');
  return res.json({ results: children });
};

exports.update = async (req, res, next) => {
  const { items } = req.body;

  const promises = items.map(async item => {
    if (item.type === 'file') {
      const updatedFile = await File.findByIdAndUpdate(
        { _id: item.data.id },
        { name: item.data.name },
        { new: true }
      ).populate('tags');
      return { type: 'file', data: updatedFile };
    } else if (item.type === 'folder') {
      const updatedFolder = await File.findByIdAndUpdate(
        { _id: item.data.id },
        { name: item.data.name },
        { new: true }
      ).populate('tags');
      return { type: 'folder', data: updatedFolder };
    }
  });
  const response = await Promise.all(promises);
  return res.json({ items: response });
};

exports.addTag = async (req, res, next) => {
  const { itemsIds, tagName } = req.body;
  try {
    const updatedFiles = await File.addTagNameToFiles(itemsIds, tagName);
    const updatedFolders = await Folder.addTagNameToFolders(itemsIds, tagName);
    return res.json({
      items: [
        ...(updatedFolders ? updatedFolders : []),
        ...(updatedFiles ? updatedFiles : [])
      ]
    });
  } catch (e) {
    console.log(e);
    return res.sendStatus(404);
  }
};

exports.deleteTag = async (req, res, next) => {
  const { itemsIds, tagId } = req.body;
  try {
    const updatedFiles = await File.removeTagByIdFromFiles(itemsIds, tagId);
    const updatedFolders = await Folder.removeTagByIdFromFolders(
      itemsIds,
      tagId
    );
    console.log(updatedFiles);
    return res.json({
      items: [
        ...(updatedFolders ? updatedFolders : []),
        ...(updatedFiles ? updatedFiles : [])
      ]
    });
  } catch (e) {
    console.log(e);
    return res.sendStatus(404);
  }
};

exports.searchTags = async (req, res, next) => {
  console.time('get all items by query input');
  const { query } = req.body;
  const foundTags = await Tag.getTagsByName(query);
  console.timeEnd('get all items by query input');
  return res.json({ tags: foundTags });
};

exports.filterByTags = async (req, res, next) => {
  const { ids } = req.body;

  const [folders, files] = await Promise.all([
    Folder.filterByTags(ids),
    File.filterByTags(ids)
  ]);
  return res.json({
    children: [
      ...folders.map((file, index) => {
        return {
          type: 'folder',
          data: file
        };
      }),
      ...files.map((file, index) => {
        return {
          type: 'file',
          data: file
        };
      })
    ]
  });
};
