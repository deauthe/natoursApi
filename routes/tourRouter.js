const express = require('express');
const {
  getAllTours,
  CreateNewTour,
  getReqTour,
  UpdateTour,
  DeleteTour,
  checkBody,
} = require('./../controllers/tourController');

const router = express.Router();
//this is mounting routes

// router.param('id', checkID);

router //instead of using "app", we use a mounted route, this makes it like the children route
  .route('/')
  .get(getAllTours)
  .post(CreateNewTour); //chaining middleware

router
  .route('/:id')
  .get(getReqTour)
  .patch(UpdateTour)
  .delete(DeleteTour);
module.exports = router;
