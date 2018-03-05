const httpStatus = require('http-status');
const expressValidation = require('express-validation');
const env = true;

/**
 * Error handler. Send stacktrace only during development
 * @public
 */
const handler = (err, req, res, next) => {
  const response = {
    code: err.status,
    message: err.message || httpStatus[err.status],
    errors: err.errors,
    stack: err.stack
  };

  if (env !== 'development') {
    delete response.stack;
  }

  res.status(err.status);
  res.json(response);
  res.end();
};
exports.handler = handler;

/**
 * If error is not an instanceOf APIError, convert it.
 * @public
 */
exports.converter = (err, req, res, next) => {
  let convertedError = err;

  if (err instanceof expressValidation.ValidationError) {
    convertedError = new Error({
      message: 'Validation error',
      errors: err.errors,
      status: err.status,
      stack: err.stack
    });
  } else if (!(err instanceof Error)) {
    convertedError = new Error({
      message: err.message,
      status: err.status,
      stack: err.stack
    });
  }

  return handler(convertedError, req, res);
};

/**
 * Catch 404 and forward to error handler
 * @public
 */
exports.notFound = (req, res, next) => {
  const err = new Error({
    message: 'Not found',
    status: httpStatus.NOT_FOUND
  });
  return handler(err, req, res);
};
