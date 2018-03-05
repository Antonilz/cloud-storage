const mongoose = require('mongoose');
const { Schema } = mongoose;
const httpStatus = require('http-status');
const slug = require('slug');

const FolderSchema = new Schema(
  {
    path: { type: String, unique: true },
    parentID: { type: Schema.Types.ObjectId, ref: 'folders' },
    name: String,
    slug: String
  },
  {
    timestamps: true
  }
);

FolderSchema.index({ name: 'text' });

/**
 * Pre Hooks
 */
FolderSchema.pre('save', async function save(next) {
  this.slug = slug(this.name);
  try {
    if (this.parentID == null) {
      this.path = this.slug;
    } else {
      const parent = await this.constructor.get(this.parentID);
      this.path = `${parent.path}/${this.slug}`;
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
    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
FolderSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'path', 'parentID', 'slug', 'updatedAt'];

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

  async getFoldersByName(queryName) {
    const nameRegEx = new RegExp(queryName, 'g');
    return await this.find({ name: { $regex: nameRegEx } }).limit(10);
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

module.exports = mongoose.model('folders', FolderSchema);
