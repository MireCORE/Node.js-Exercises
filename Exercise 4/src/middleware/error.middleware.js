const errorHandler = (err, _req, res, next) => {
  if (res.headersSent) return next(err);
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error.';
  let details = err.details || null;

  if (err.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${duplicateField} already exists.`;
    details = null;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Database validation failed.';
    details = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message
    }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}.`;
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Request body contains invalid JSON.';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body is too large.';
  } else if (err.name === 'MulterError') {
    statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Profile image is too large. Maximum size is 5 MB.'
      : err.message;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  } else if (statusCode >= 500) {
    console.error(err.message);
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV !== 'production' && statusCode >= 500 ? { stack: err.stack } : {})
  });
};

export default errorHandler;
