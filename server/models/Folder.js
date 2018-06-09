const mongoose = require('mongoose');
const { Schema } = mongoose;
const httpStatus = require('http-status');
const moment = require('moment');
const slug = require('slug');
const Tag = require('./Tag');

const FolderSchema = new Schema(
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
    if (this.isModified('name')) {
      // update all descandant nodes path
      let descendants = [this.id];
      let stack = [this.id];
      while (stack.length > 0) {
        let currentNode = stack.pop();
        let children = await this.constructor.getChildrenNodes(currentNode);
        children.forEach(child => {
          descendants.push(child._id);
          stack.push(child._id);
        });
        stack.forEach(async id => {
          const child = await this.constructor.get(id);
          const updatedChild = await child.save();
        });
      }
    }
    this.formattedLastModified = moment(this.updatedAt).format(
      'DD/MM/YYYY HH:mm'
    );
    return next();
  } catch (error) {
    return next(error);
  }
});

FolderSchema.pre('find', function() {
  this.populate('tags');
});

/**
 * Methods
 */
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

/**
 * Statics
 */
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

      throw new Error({
        message: 'Folder does not exist',
        status: httpStatus.NOT_FOUND
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

  async getFoldersByName(queryName) {
    const nameRegEx = new RegExp(
      queryName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
      'g'
    );
    return await this.find(
      { name: { $regex: nameRegEx } },
      'id name path pathSlug'
    ).limit(10);
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
    console.log(error);
    if (error.name === 'MongoError' && error.code === 11000) {
      return new Error({
        message: 'Validation Error',
        errors: [
          {
            field: 'path',
            location: 'body',
            messages: ['"path" already exists']
          }
        ],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack
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
    let stack = [parentID];
    while (stack.length > 0) {
      let currentNode = stack.pop();
      let children = await this.getChildrenNodes(currentNode);
      children.forEach(child => {
        descendants.push(child._id);
        stack.push(child._id);
      });
    }
    return descendants;
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
