const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const mongoose = require('mongoose');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError(`No document found with that id `));
    }

    res.status(204).json({
      status: 'success',
      message: 'successsfully deleted',
    });
  });
//this works because of javaAScript closures, read more

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc)
      return next(
        new AppError(`no document found with this id: ${req.params.id}`, 404),
      );

    res.status(200).json({
      status: 'pass',
      message: 'doc successfully updated',
      doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
      status: 'pass',
      message: 'document created ',
      doc,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('no document exists with this id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //we got rid of the try and catch block throwugh the catchAsync method
    //now the global error handler handles the error of every method in here

    //executing the QUERY
    //req.query already include the queries in our request to the api,
    //this is done by expressjs

    let filter = {}; //this is done only for the getAllreviews and won't effect other queries to all nested queries
    if (req.params.tourId) filter = { tour: req.params.tourId }; //this is allowing nested routes too

    const features = new APIFeatures(Model.find(), req.query) //ApiFeatures returns an object with two keys=> query and queryString
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;
    if (!docs)
      return next(new AppError('no documents for this Model were Found', 404));

    res.status(200).json({
      status: 'Success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
