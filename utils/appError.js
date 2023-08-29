class AppError extends Error {
  //Error is a built in class
  constructor(message, statusCode) {
    super(message); //super calls the parent class method, here the Error class, as it accepts only one param which is the message
    this.statusCode = statusCode;
    this.status = toString(statusCode).startsWith(
      '4',
    )
      ? 'fail'
      : 'error';
    this.isOperational = true; //this is for testing as programming error would not have this property, unless an actuall error object triggers
    //operational errors will be the only errors we want to send error messages for
    Error.captureStackTrace(
      this,
      this.constructor,
    ); //dunno what this means
  }
}

module.exports = AppError;
