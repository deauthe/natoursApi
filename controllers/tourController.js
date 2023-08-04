const express = require('express');
const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(
    `${__dirname}/../dev-data/data/tours-simple.json`
  )
);

exports.checkID = (req, res, next, val) => {
  //since this is quite above in the middleWare queue, req will pass through this before
  //encountering below middleWare, this saves us repeated checking of valid id values
  if (val > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'bad request',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  //route handler: to be called when a req is made at a route
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

exports.getReqTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1; //multiplying by 1 makes the string into a number if it is one

  const reqTour = tours.find(
    (el) => el.id === id
  );

  console.log(id);
  console.log(reqTour);

  res.status(200).json({
    status: 'success',
    data: {
      tours: reqTour,
    },
  });
};

exports.CreateNewTour = (req, res) => {
  console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign(
    { id: newId },
    req.body
  ); //object.assign keeps the old properties and modifies or creates the mentioned ones
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours), //because tours is just a normal js object for now
    (err) => {
      res.status(201).json({
        //this also sends a res so no need to use res.send after it
        status: 'success',
        data: {
          tour: newTour,
        },
      }); //creation
    }
  );
}; //using the sync method will block the event loop as were in a callback function
//always send something to complete the req (but .json also sends a response, and we cant use 2 in 1, so use either or)

exports.UpdateTour = (req, res) => {
  //method doesn't really delete patch, just an example

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<..updataed tour here..>',
    },
  });
};
exports.DeleteTour = (req, res) => {
  //method doesn't really delete shit, just an example
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
