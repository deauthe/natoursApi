const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(
    /(["'])(\\?.)*?\1/,
  )[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(
    //The Object.values() static method returns an array of a given object's own enumerable string-keyed property values.
    (el) => el.message,
  );

  const message = `Invalid input data. ${errors.join(
    '. ',
  )}`;
  return new AppError(message, 400);
};

const handleJWTerror = () => {
  return new AppError(
    'Invalid token, please sign in again',
    401,
  );
};

const handleJWTExpiredError = () => {
  return new AppError(
    'token expired, please login again',
    401,
  );
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    source: 'from error handler',
    error: err,
    messsage: err.message,
    stack: err.stack, //this tells us where the err happened
  });
};
const sendErroProd = (err, res) => {
  if (err.isOperational) {
    //operational error
    res.status(err.statusCode).json({
      status: err.status,
      messsage: err.message,
    });
  } else {
    //programming error or other
    console.error('ERROR', err);
    //sending a generi message for an avg user
    res.status(500).json({
      status: 'error',
      messsage: 'something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  //any middleware with 4 arguments is already recognized by express as an error handler
  //we define a default statusCode if not defined already by some other middleWare
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  console.log('error controller working!!');
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (
    process.env.NODE_ENV === 'production'
  ) {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError')
      error = handleCastErrorDB(error);
    if (error.code === 11000)
      error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError')
      error = handleJWTerror();
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError();

    sendErroProd(error, res);
  }
};
