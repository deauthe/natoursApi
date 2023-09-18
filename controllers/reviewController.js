const express = require('express');
const Review = require('./../models/reviewModel');
const CatchAsync = require('./../utils/catchAsync');
const handlerFactory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  //middleWare to run before creating reviews
  //allow nested routes
  //POST /reviews and POST /tour/:tourID/reviews works the same
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; //we get this from the authController.protect middleware
  next();
};
exports.getAllReviews = handlerFactory.getAll(Review);
exports.getReview = handlerFactory.getOne(Review);
exports.createReview = handlerFactory.createOne(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);
exports.updateReview = handlerFactory.updateOne(Review);
