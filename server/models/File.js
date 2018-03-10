const mongoose = require('mongoose');
const aws = require('aws-sdk');
const Minio = require('minio');
const { Schema } = mongoose;
const slug = require('slug');
const contentDisposition = require('content-disposition');
const httpStatus = require('http-status');
const Folder = require('./Folder');
const keys = require('../config/keys');

const FileSchema = new Schema(
  {
    name: { type: String, required: [true, "can't be blank"] },
    uuid: {
      type: String,
      required: [true, "can't be blank"],
      unique: true
    },
    parentID: { type: Schema.Types.ObjectId, ref: 'Folder' },
    path: {
      type: String
    },
    pathSlug: {
      type: String
    },
    tags: [{ type: String }],
    size: Number,
    type: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true
  }
);

FileSchema.index({ name: 'text' });

/**
 * Pre Hooks
 */
FileSchema.pre('save', async function save(next) {
  try {
    if (this.parentID != null) {
      const parentFolder = Folder.get(this.parentID);
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
    return next();
  } catch (error) {
    return next(error);
  }
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
      'type',
      'updatedAt'
    ];

    fields.forEach(field => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  getDownloadLink(disposition = 'attachment') {
    const minioClient = new Minio.Client({
      //endPoint: 'play.minio.io',
      endPoint: '127.0.0.1',
      port: 10000,
      secure: true,
      accessKey: keys.storageAccessKey,
      secretKey: keys.storageSecretAccessKey
    });

    /*
        const s3 = new aws.S3({
            signatureVersion: 'v4',
            region: 'us-east-1',
            s3ForcePathStyle: true,
            sslEnabled: false,
            accessKeyId: keys.storageAccessKey,
            secretAccessKey: keys.storageSecretAccessKey,
            endpoint: keys.endpoint
        });
        */
    const params = {
      Bucket: keys.bucketName,
      Key: this.uuid,
      ResponseContentDisposition: contentDisposition(this.name, {
        type: disposition // inline, attachment
      })
    };

    return new Promise((resolve, reject) => {
      /*s3.getSignedUrl('getObject', params, (err, url) => {
                if (err) reject(err);
                else resolve(url);
            });*/
      minioClient.presignedGetObject(params.Bucket, params.Key, (err, url) => {
        if (err) reject(err);
        else resolve(url);
      });
    });
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
    return await this.find({ parentID: parentID });
  },

  async getFilesByName(queryName) {
    const nameRegEx = new RegExp(queryName, 'i');
    return await this.find({ name: { $regex: nameRegEx } }).limit(10);
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
