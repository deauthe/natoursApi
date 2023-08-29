const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(
  async (req, res, next) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    //we didn't do const newUser = await User.create(req.body) simply because then anyone couldve added
    //an admin field in it and registered as an admin, so we deconstruct and only add fields
    //imp for every user,
    //so we will have to add admins through the mongodb compass manually

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  },
);

exports.login = catchAsync(
  async (req, res, next) => {
    const { email, password } = req.body;
    //1)check if email and pass exist
    if (!email || !password) {
      const error = new AppError(
        'please fill the email and password',
        400,
      );
      return next(error);
    }

    //2)check if user exists and password matches
    const user = await User.findOne({
      email: email,
    }).select('+password'); //+ means adding the field that has select:false in the userModel

    if (
      !user ||
      !user.correctPassword(
        user.password,
        password,
      )
    ) {
      return next(
        new AppError(
          'Inorrect email or Password',
          401,
        ),
      );
    }

    console.log(user);
    //3) if everything good, send token to client
    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
  },
);
