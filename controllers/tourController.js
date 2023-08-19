const express = require('express');
const Tour = require('./../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields =
    'name,price,ratingsAverage,summary,difficulty';
  next();
}; //sets the query strings so the user fills only abstract data

exports.getAllTours = async (req, res) => {
  try {
    //BUILDING THE QUERY
    const queryObj = { ...req.query }; //creating a hardcopy, study what is this and why like this in js

    //Filtering
    const excludedFields = [
      //to narrow the queryObj
      'page',
      'sort',
      'limit',
      'fields',
    ];
    excludedFields.forEach((el) => {
      //deleting these fields from the query
      delete queryObj[el];
    });

    //Advanced Filtering
    let queryStr = JSON.stringify(queryObj); //we use let and const , so the replace method actually does shit
    queryStr = queryStr.replace(
      /\b(gte,gt,lte,lt)\b/g,
      (match) => `$${match}`,
    ); //added dollar sign after every match to match mongo db query tehniques if not already taken care of when requesting with the api
    // /\b(gte,gt,lte,lt)\b/ is a regular expression in js. study more about regular expressions

    let query = Tour.find(JSON.parse(queryStr)); //did not await this as we build it first(other methods like sorting) and then  await it

    if (req.query.sort) {
      const sortBy = req.query.sort
        .split(',')
        .join(' '); // sort will have multiple parameters separated by commas as reqs don't support spaes
      //although mongo needs spaces in the .sort('price' 'requestedAt' 'ratings')
      //like that to sort wrt to all the params

      query = query.sort(sortBy);
      //req.query.sort is a part of the object query
      //so if the req has a query to sort,
      //it calls the sort method from mongoose
    } else {
      query = query.sort('-createdAt'); //negative sign means descending order
    }

    //field Limiting

    if (req.query.fields) {
      const fieldsVisible = req.query.fields
        .split(',')
        .join(' ');
      query = query.select(fieldsVisible, '-__v');
    } else {
      query = query.select('-__v'); //negative sign removes the field and sends everything else
    }

    //pagination

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skippedValues = (page - 1) * limit; //the results lying before the current page
    query = query
      .skip(skippedValues)
      .limit(limit); //skip and limit are mongoose methods
    if (req.query.page) {
      const numTours =
        await Tour.countDocuments();
      if (skippedValues > numTours)
        throw new Error(
          "this page doesn't exist",
        );
    }

    //executing the QUERY
    const tours = await query;

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours: tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.getReqTour = async (req, res) => {
  try {
    const reqTour = await Tour.findById(
      req.params.id,
    );
    res.status(200).json({
      status: 'success',
      data: {
        reqTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.CreateNewTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.UpdateTour = async (req, res) => {
  console.log(req.body);
  try {
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
  } catch (err) {
    console.log(`err is : ${err}`);
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.DeleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      message: 'tour deleted',
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
