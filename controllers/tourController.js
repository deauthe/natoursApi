const express = require('express');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields =
    'name,price,ratingsAverage,summary,difficulty';
  next();
}; //sets the query strings so the user fills only abstract data

exports.getAllTours = catchAsync(
  async (req, res, next) => {
    //we got rid of the try and catch block throwugh the catchAsync method
    //now the global error handler handles the error of every method in here

    //executing the QUERY
    const features = new APIFeatures(
      Tour.find(),
      req.query,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours: tours,
      },
    });
  },
);
exports.getReqTour = catchAsync(
  async (req, res, next) => {
    const reqTour = await Tour.findById(
      req.params.id,
    );
    if (!reqTour) {
      return next(
        new AppError(
          'No Tour found with tha t ID',
          404,
        ),
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        reqTour,
      },
    });
  },
);

// const catchAsync = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };
// }; this could be done to completely get rid of try and atch blocks, but i'm trying to keep it simple
//catch(next) passes the wtv catch() catches and then passes it as an argument to next() which then basically tells it that it's an error
//it then calls the global error handler
//wtv func that we wanted to be cleaner and free of try catch would be written inside this function for eg:
// createNewTour = catchAsync(async (req,res)=>{
//body of the function
// })

exports.CreateNewTour = catchAsync(
  async (req, res, next) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  },
);

exports.UpdateTour = catchAsync(
  async (req, res, next) => {
    console.log(req.body);

    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  },
);
exports.DeleteTour = catchAsync(
  async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(
      req.params.id,
    );
    if (!reqTour) {
      return next(
        new AppError(
          'No Tour found with that ID',
          404,
        ),
      );
    }
    res.status(204).json({
      status: 'success',
      message: 'tour deleted',
    });
  },
);

exports.getTourStats = catchAsync(
  async (req, res, next) => {
    const stats = Tour.aggregate([
      //this is a mongodb feature to create a pipeline
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty', //so it groups items in all kinds of difficulties and then calculates the below properties for all difficulties separately,
          //amazing
          results: { $sum: 1 }, //adds 1 to results for everyTour
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          maxPrice: { $max: '$price' },
          minPrice: { $min: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 }, //we're using fieldnames we defined in the group stage //1 is for ascending
      },
      //{
      //   $match:{_id:{$ne:'easy'}}//ne means not equal
      // }
    ]);
    const tours = await stats;
    res.status(200).json({
      status: 'success',
      results: stats.length,
      data: {
        tours,
      },
    });
  },
);
exports.getMonthlyPlans = catchAsync(
  async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      { $unwind: '$startDates' }, //separates arrays into it's own field
      {
        $match: {
          startDates: {
            //we're using the unwinded startDates now
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: {
            $month: '$startDates',
          },
          numTourStats: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      { $sort: { numTourStarts: -1 } },
      {
        $limit: 12,
      },
    ]);
    res.status(200).json({
      status: 'success',
      results: plan.length,
      data: {
        plan,
      },
    });
  },
);
