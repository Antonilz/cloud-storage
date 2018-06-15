const mongoose = require('mongoose');
const { Schema } = mongoose;
const httpStatus = require('http-status');
const moment = require('moment');
const slug = require('slug');
const Tag = require('./Tag');
const APIError = require('../utils/APIError');

const FolderSchema = new mongoose.Schema(
  {
    path: { type: String, unique: true },
    pathSlug: { type: String, unique: true },
    parentID: { type: Schema.Types.ObjectId, ref: 'folders' },
    name: { type: String, required: [true, "can't be blank"] },
    nameSlug: String,
    formattedLastModified: String,
    tags: [{ type: Schema.Types.ObjectId, ref: 'tags' }]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
      }
    }
  }
);

FolderSchema.index({ name: 'text' });

/**
 * Pre Hooks
 */
FolderSchema.pre('save', async function save(next) {
  this.nameSlug = slug(this.name);
  try {
    if (this.parentID == null) {
      this.path = this.name;
      this.pathSlug = this.nameSlug;
    } else {
      const parent = await this.constructor.get(this.parentID);
      this.path = `${parent.path}/${this.name}`;
      this.pathSlug = `${parent.pathSlug}/${this.nameSlug}`;
    }
    this.formattedLastModified = moment(this.updatedAt).format(
      'DD/MM/YYYY HH:mm'
    );
    return next();
  } catch (error) {
    return next(error);
  }
});

FolderSchema.pre('findOneAndUpdate', async function save(next) {
  this._update.nameSlug = slug(this._update.name);

  try {
    const oldFile = await this.model.get(this._conditions._id._id);
    if (oldFile.parentID == null) {
      this._update.path = this._update.name;
      this._update.pathSlug = this._update.nameSlug;
    } else {
      const parent = await this.model.get(oldFile.parentID);
      this._update.path = `${parent.path}/${this._update.name}`;
      this._update.pathSlug = `${parent.pathSlug}/${this._update.nameSlug}`;
    }
    this._update.formattedLastModified = moment(this._update.updatedAt).format(
      'DD/MM/YYYY HH:mm'
    );
    return next();
  } catch (error) {
    return next(error);
  }
});

FolderSchema.post('findOneAndUpdate', async function save(next) {
  if (this._update.name) {
    // update all descandant nodes path
    let descendants = [this._conditions._id];
    while (descendants.length > 0) {
      const currentNodeId = descendants.pop();
      console.log('current node id', currentNodeId);
      const currentNode = await this.model.get(currentNodeId);
      await currentNode.save();
      let childrenToCheck = await this.model.getChildrenNodes(currentNode.id);
      descendants.push(...childrenToCheck.map(child => child._id));
      console.log('new stack', descendants);
    }
  }
});

FolderSchema.pre('find', function() {
  this.populate('tags');
});

FolderSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'id',
      'name',
      'path',
      'parentID',
      'nameSlug',
      'pathSlug',
      'updatedAt',
      'formattedLastModified'
    ];

    fields.forEach(field => {
      transformed[field] = this[field];
    });

    return transformed;
  }
});

FolderSchema.statics = {
  /**
   * Get folder by id
   *
   * @param {ObjectId} id - The objectId of folder.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      let folder;

      if (mongoose.Types.ObjectId.isValid(id)) {
        folder = await this.findById(id).exec();
      }

      if (folder) {
        return folder;
      }

      throw new APIError({
        message: 'Folder does not exist',
        httpStatus: httpStatus.NOT_FOUND
      });
    } catch (error) {
      throw error;
    }
  },

  async addTagNameToFolders(itemsIds, tagName) {
    const query = {},
      update = { expire: new Date() },
      options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const tag = await Tag.findOneAndUpdate({ name: tagName }, update, options);
    await this.update(
      { _id: { $in: itemsIds } },
      { $addToSet: { tags: tag._id } },
      { multi: true }
    );
    return await this.find({ _id: { $in: itemsIds } }).populate('tags');
  },

  async removeTagByIdFromFolders(itemsIds, tagId) {
    await this.update(
      { _id: { $in: itemsIds } },
      { $pullAll: { tags: [{ _id: mongoose.Types.ObjectId(tagId) }] } },
      { multi: true }
    );
    return await this.find({ _id: { $in: itemsIds } });
  },

  async getFoldersByName(queryName, limit) {
    const nameRegEx = new RegExp(
      queryName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
      'g'
    );
    return await this.find(
      { name: { $regex: nameRegEx } },
      'id name path pathSlug'
    ).limit(limit);
  },

  async filterByTags({ ids }) {
    return await this.find({
      tags: { $all: ids.map(id => mongoose.Types.ObjectId(id)) }
    });
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateFolder(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        httpStatus: httpStatus.CONFLICT
      });
    }
    return error;
  },

  async getUpGoingFolderStructure(link) {
    const structure = [];
    const { links } = formatLinkToPathSlugs(link);
    console.log(links);
    const hierarchy = await Promise.all(
      links.map(async link => {
        return await this.findOne({
          pathSlug: link
        });
      })
    );
    hierarchy.unshift({ _id: null });
    const children = await this.constructor.getChildrenNodes(folder._id);
    const maxDepth = hierarchy.length;
    const currentDepth = 0;
    const folderStructure = hierarchy.reduce(async (acc, folder) => {
      acc.children = [folder];
    }, {});
  },

  async getChildrenNodes(parentID) {
    return await this.find({ parentID: parentID });
  },

  async getDescendants(parentID) {
    let descendants = [parentID];
    const allIDs = [parentID];
    while (descendants.length > 0) {
      const currentNodeId = descendants.pop();
      const currentNode = await this.get(currentNodeId);
      let childrenToCheck = await this.getChildrenNodes(currentNode.id);
      descendants.push(...childrenToCheck.map(child => child._id));
      allIDs.push(...childrenToCheck.map(child => child._id));
    }
    return allIDs;
  }
};

function formatLinkToPathSlugs(link) {
  const names = link.split('/').filter(val => val != '');
  const links = [];
  names.reduce((acc, val, index) => {
    if (index === 0) {
      return (links[index] = `${val}`);
    }
    return (links[index] = `${acc}/${val}`);
  }, '');
  return { links };
}

module.exports = mongoose.model('folders', FolderSchema);
