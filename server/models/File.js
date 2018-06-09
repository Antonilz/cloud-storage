const mongoose = require('mongoose');
const { Schema } = mongoose;
const slug = require('slug');
const contentDisposition = require('content-disposition');
const httpStatus = require('http-status');
const moment = require('moment');
const { getSignedDownloadLink, deleteObject } = require('../services/minio');
const { formatBytes } = require('../utils/formatBytes');
const Folder = require('./Folder');
const Tag = require('./Tag');
const keys = require('../config/keys');

const FileSchema = new Schema(
  {
    name: { type: String, required: [true, "can't be blank"] },
    uuid: {
      type: String,
      required: [true, "can't be blank"],
      unique: true
    },
    parentID: { type: Schema.Types.ObjectId, ref: 'folders' },
    path: {
      type: String
    },
    pathSlug: {
      type: String
    },
    tags: [{ type: Schema.Types.ObjectId, ref: 'tags' }],
    size: Number,
    type: String,
    formattedSize: String,
    formattedLastModified: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.uuid;
        delete ret.createdAt;
      }
    }
  }
);

FileSchema.index({ parentID: 1 });

/**
 * Pre Hooks
 */
FileSchema.pre('save', async function save(next) {
  try {
    if (this.isNew) {
      this.formattedSize = formatBytes(this.size);
    }
    this.formattedLastModified = moment(this.updatedAt).format(
      'DD/MM/YYYY HH:mm'
    );
    if (this.parentID != null) {
      const parentFolder = await Folder.get(this.parentID);
      this.path = parentFolder.path;
      this.pathSlug = parentFolder.pathSlug;
    } else {
      this.path = '';
      this.pathSlug = '';
    }
    return next();
  } catch (error) {
    return next(error);
  }
});

FileSchema.pre('remove', async function save(next) {
  try {
    this.constructor
      .find({
        uuid: this.uuid
      })
      .count(function(err, count) {
        console.log('Number of files with same s3 link: ', count);
      });
    await deleteObject(keys.bucketName, this.uuid);
    return next();
  } catch (error) {
    return next(error);
  }
});

FileSchema.pre('find', function() {
  this.populate('tags');
});

FileSchema.pre('update', function save(next) {
  this.populate('tags');
  console.log('updating');
  this.formattedLastModified = moment(this.updatedAt).format(
    'DD/MM/YYYY HH:mm'
  );
  return next();
});

/**
 * Methods
 */
FileSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'id',
      'name',
      'nameSlug',
      'parentID',
      'path',
      'pathSlug',
      'size',
      'formattedSize',
      'formattedLastModified',
      'type',
      'updatedAt',
      'tags'
    ];

    fields.forEach(field => {
      transformed[field] = this[field];
    });
    return transformed;
  },

  async getDownloadLink() {
    const attachmentURL = await getSignedDownloadLink({
      bucketName: keys.bucketName,
      objectName: this.uuid,
      fileName: this.name,
      contentDispositionType: 'attachment'
    });

    const inlineURL = await getSignedDownloadLink({
      bucketName: keys.bucketName,
      objectName: this.uuid,
      fileName: this.name,
      contentDispositionType: 'inline'
    });
    return { inlineURL, attachmentURL };
  }
});

/**
 * Statics
 */
FileSchema.statics = {
  /**
   * Get file by id
   *
   * @param {ObjectId} id - The objectId of file.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      let file;

      if (mongoose.Types.ObjectId.isValid(id)) {
        file = await this.findById(id).exec();
      }

      if (file) {
        return file;
      }

      throw new Error({
        message: 'File does not exist',
        status: httpStatus.NOT_FOUND
      });
    } catch (error) {
      throw error;
    }
  },

  async getChildrenNodes(parentID) {
    return await this.find({
      parentID: parentID ? mongoose.Types.ObjectId(parentID) : null
    });
  },

  async getFilesByName(queryName) {
    const nameRegEx = new RegExp(
      queryName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
      'i'
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

  async addTagNameToFiles(itemsIds, tagName) {
    const query = {},
      update = { expire: new Date() },
      options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const tag = await Tag.findOneAndUpdate({ name: tagName }, update, options);
    await this.update(
      { _id: { $in: itemsIds } },
      { $addToSet: { tags: tag._id } },
      { multi: true }
    );
    return await this.find(
      { _id: { $in: itemsIds } },
      'id formattedLastModified'
    );
  },
  async removeTagByIdFromFiles(itemsIds, tagId) {
    await this.update(
      { _id: { $in: itemsIds } },
      { $pullAll: { tags: [{ _id: mongoose.Types.ObjectId(tagId) }] } },
      { multi: true }
    );
    return await this.find({ _id: { $in: itemsIds } });
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateFile(error) {
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
  }
};

module.exports = mongoose.model('files', FileSchema);
