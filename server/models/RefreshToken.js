const mongoose = require('mongoose');
const crypto = require('crypto');
const moment = require('moment-timezone');

const RefreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: 'String',
    ref: 'User',
    required: true
  },
  expires: { type: Date }
});

RefreshTokenSchema.statics = {
  /**
   * Generate a refresh token object and saves it into the database
   *
   * @param {User} user
   * @returns {RefreshToken}
   */
  generate(user) {
    const userId = user._id;
    const userEmail = user.email;
    const token = `${userId}.${crypto.randomBytes(40).toString('hex')}`;
    const expires = moment()
      .add(30, 'days')
      .toDate();
    const tokenObject = new RefreshToken({
      token,
      userId,
      userEmail,
      expires
    });
    tokenObject.save();
    return tokenObject;
  }
};

const RefreshToken = mongoose.model('refreshTokens', RefreshTokenSchema);
module.exports = RefreshToken;
