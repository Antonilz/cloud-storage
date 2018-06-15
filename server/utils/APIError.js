module.exports = class APIError extends Error {
  /**
   * Constructs the APIError class
   * @param {String} message an error message
   * @constructor
   */
  constructor({ message, httpStatus }) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.httpStatus = httpStatus;
  }
};
