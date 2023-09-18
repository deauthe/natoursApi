const express = require('express');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const handlerFactory = require('./handlerFactory');

const filterObj = (object, ...allowedFields) => {
  //this is how we take in a variable number of arguments
  const newObj = {};
  Object.keys(object).forEach((el) => {
    //Object is different than object here
    if (allowedFields.includes(el)) {
      newObj[el] = object[el];
    }
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'password cannot be modified from here, use patch on /updatePassword',
      ),
      400,
    );
  }
  //2)filtering out unwanted fields not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  //3)update user document
  //now we can't use user.save() because save runs all the validators and password confirm will not be part of the request here

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'pass',
    message: 'user updated',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });
  console.log(user);
  res.status(204).json({
    status: 'success',
    user,
  });
});

exports.getMe = (req, res, next) => {
  //to add this param so we can chain this middleWare with the getOne from handlerFactory
  req.params.id = req.user.id;
  next();
};

exports.getAllusers = handlerFactory.getAll(User);
//DO NOT change passwords wiht this
exports.updateUser = handlerFactory.updateOne(User);

exports.getReqUser = handlerFactory.getOne(User);

exports.deleteUser = handlerFactory.deleteOne(User);
