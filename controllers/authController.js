const { promisify } = require('util');
const crypto = require('crypto');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const sendMail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 4 * 60 * 60 * 1000,
    ),

    httpOnly: true, //will block browser to read or modify the cookie
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; //will only be sent on a secure connection ie https,

  res.cookie('jwt', token, cookieOptions); //sends a cookie with name jwt, data as token, and options
  //cookies need to have different names to exist together, name is their unique identifier

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  //we didn't do const newUser = await User.create(req.body) simply because then anyone couldve added
  //an admin field in it and registered as an admin, so we deconstruct and only add fields
  //imp for every user,
  //so we will have to add admins through the mongodb compass manually

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1)check if email and pass exist
  if (!email || !password) {
    const error = new AppError('please fill the email and password', 400);
    return next(error);
  }

  //2)check if user exists and password matches
  const user = await User.findOne({
    email: email,
  }).select('+password'); //+ means adding the field that has select:false in the userModel

  if (!user || !user.correctPassword(user.password, password)) {
    return next(new AppError('Inorrect email or Password', 401));
  }

  console.log(user);
  //3) if everything good, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //this is because we're gonna send tokens as http headers, w postman for now for testing
    token = req.headers.authorization.split(' ')[1]; //the part after a space to 'bearer' would be our token, this is a format we defined
  }
  console.log(token);

  if (!token) {
    const error = new AppError(
      'you are not logged in, Please log in to get access',
      401,
    );
    return next(error);
  }

  // 2)verifiation token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  //3)check if user still exists,so if the user deletes itself, token should not exist:
  const concernedUser = await User.findById(decoded.id);
  if (!concernedUser) {
    const noExistenceError = new AppError(
      "this user doesn't exist anymore, sign up again or login with an existing account",
      401,
    );
    return next(noExistenceError);
  }

  //4)check if user changed password after the jwt was issued
  //this is implemented in userModel as an instance method as every document needs to have access to it

  const tokenIssueTime = decoded.iat;
  const validToken = await concernedUser.changedPasswordAfterLogin(
    tokenIssueTime,
  );

  if (validToken) {
    const error = new AppError(
      'password has been changed in this session, login again',
      401,
    );
    return next(error);
  }
  //GRANT ACCESS TO PROTECTED ROUTES
  req.user = concernedUser; //this is an example of passing information to wtv next middleware there is, so it makes our lives easier for connected chains
  next();
});

exports.restrictTo = (...roles) => {
  //roles is an array, so we use a wrapper function and these arguments get passed furthur
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      //if user's role is not in the required roles of this function(arguments when calling) it shows error
      //req.user is borrowed from protect function as it will always run before this one does
      const error = new AppError(
        "you don't have permission to perform this action",
        403,
      );
      next(error);
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  console.log('req working!');
  //get user with the provided email
  const email = req.body.email;
  const user = await User.findOne({
    email: email,
  });

  if (!user) {
    return next(
      new AppError(
        "there's no user with this email, please  enter another email or sign in ",
        404,
      ),
    );
  }

  //)generate the random reset token
  const resetToken = await user.createPasswordResetToken();

  await user.save({
    validateBeforeSave: false,
  }); //we passed this option because when we save, it will show a validation error for all the things we didn tpass

  //3)send it to user's mail
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a path request with your new password and passwordConfirm to ${resetURL}.\n if you didn't intend this, ignore this mail`;
  try {
    await sendMail({
      email: user.email,
      subject: 'password reset token(expires in 10 minutes',
      text: message,
    });
    res.status(200).json({
      status: 'success',
      message: 'token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({
      validateBeforeSave: false,
    });
    return next(new AppError(err, 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user correspoding to token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token) //as this will be called at the url sent to user with email, this contains the real token, so encrypting it again to compare to user
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2) if token has not expired, and there is a new user, set the new password
  if (!user) {
    return next(new AppError('user not found', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3) update changedPasswordAt
  //this is done in the userModel part and not here so that it runs before every time a doc is saved

  //4) log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)get user from collection
  const user = await User.findById(req.user.id).select('+password');
  // 2)check if posted current password is correctPassword

  if (!(await user.correctPassword(req.body.password, user.password))) {
    const error = new AppError(
      'provided password does not match the user',
      401,
    );
    return next(error);
  }

  // 3) if so, update password
  user.password = req.body.password;

  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //user.findbyidAndUpadate will not work as intended
  //because validators don't work on save

  // 4)log user in,send jwt
  createSendToken(user, 200, res);
});
