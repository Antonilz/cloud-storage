const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const { secret } = require('../config/keys');
const { jwtExpirationInterval } = require('../config/keys');
const APIError = require('../utils/APIError');

const env = 'test';
const roles = ['user', 'admin'];

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, 'username is invalid']
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      trim: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, 'email is invalid']
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 20
    },
    role: {
      type: String,
      enum: roles,
      default: 'user'
    },
    hash: String,
    salt: String
  },
  { timestamps: true }
);

//UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });

UserSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();

    const rounds = env === 'test' ? 1 : 10;

    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'email'];

    fields.forEach(field => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  token() {
    const payload = {
      exp: moment()
        .add(jwtExpirationInterval, 'minutes')
        .unix(),
      iat: moment().unix(),
      sub: this._id
    };
    return jwt.encode(payload, secret);
  },

  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  }
});

UserSchema.statics = {
  roles,

  /**
   * Get user
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      let user;

      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await this.findById(id).exec();
      }
      if (user) {
        return user;
      }

      throw new APIError({
        message: 'User does not exist',
        httpStatus: httpStatus.UNPROCESSABLE_ENTITY
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findAndGenerateToken(options) {
    const { email, password, refreshObject } = options;

    if (!email && !refreshObject)
      throw new APIError({
        message: 'An email is required to generate a token',
        httpStatus: httpStatus.UNPROCESSABLE_ENTITY
      });
    const user = await this.findOne({
      email: email || refreshObject.userEmail
    }).exec();
    let message;
    if (password) {
      if (user && (await user.passwordMatches(password))) {
        return { user, accessToken: user.token() };
      } else if (!user) {
        message = 'No user with given email found';
      } else {
        message = 'Incorrect password';
      }
    } else if (refreshObject) {
      return { user, accessToken: user.token() };
    } else {
      message = 'Incorrect email or refreshToken';
    }
    throw new APIError({
      message,
      httpStatus: httpStatus.UNPROCESSABLE_ENTITY
    });
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error}
   */
  checkDuplicateEmail(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      throw new APIError({
        message: 'email already exists',
        httpStatus: httpStatus.UNPROCESSABLE_ENTITY
      });
    }
  }
};

module.exports = mongoose.model('users', UserSchema);
