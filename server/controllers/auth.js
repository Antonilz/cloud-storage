const httpStatus = require('http-status');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const moment = require('moment-timezone');
const { jwtExpirationInterval } = require('../config/keys');

/**
 * Returns a formated object with tokens
 * @private
 */
function generateTokenResponse(user, accessToken) {
  const tokenType = 'Bearer';
  const refreshToken = RefreshToken.generate(user).token;
  const expiresIn = moment().add(jwtExpirationInterval, 'minutes');
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn
  };
}

/**
 * Returns jwt token if registration was successful
 * @public
 */
exports.register = async (req, res, next) => {
  try {
    const user = await new User(req.body).save();
    const userTransformed = user.transform();
    const token = generateTokenResponse(user, user.token());
    res.status(httpStatus.CREATED);
    return res.json({ token, user: userTransformed });
  } catch (error) {
    console.log(error);
    return next(User.checkDuplicateEmail(error));
  }
};

/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
exports.login = async (req, res, next) => {
  try {
    const { user, accessToken } = await User.findAndGenerateToken(req.body);
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return res.status(error.httpStatus).json(error.message);
  }
};

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const refreshObject = await RefreshToken.findOneAndRemove({
      token: refreshToken
    });

    const { user, accessToken } = await User.findAndGenerateToken({
      refreshObject
    });
    const userTransformed = user.transform();
    const token = generateTokenResponse(user, accessToken);
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(error);
  }
};
