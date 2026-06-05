export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Fatal Engine Process Interruption Exception',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};