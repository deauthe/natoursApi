const express = require('express');
const cathcAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');

module.exports.getAllusers = cathcAsync(
  async (req, res) => {
    const users = await User.find();
    res.status(200).json({
      status: 'pass',
      data: users,
    });
  },
);
module.exports.createNewUser = cathcAsync(
  async (req, res) => {
    const newUser = await User.create(req.body);
    res.status(200).json({
      status: 'pass',
      data: newUser,
    });
  },
);
module.exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messsage: 'this path is not yet defined',
  });
};
module.exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messsage: 'this path is not yet defined',
  });
};
module.exports.getReqUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messsage: 'this path is not yet defined',
  });
};
