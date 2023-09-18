const express = require('express');
const tourController = require('./../controllers/tourController');

const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRouter');
const router = express.Router();
//this is mounting routes

//POST /tour/1234124234234/reviews => example of a route when posting a review so the review must already be attatched ot a tourId and the currently logged in user
//similarly:
//GET /tour/123123/reviews/12312h2131

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview,
//   );

//now the above thing would'nt make complete sense because we're using the reviewController in the tourrouter, so to make this  cleaner
//we use an advanced express feature called mergeParams

router.use('/:tourId/reviews', reviewRouter); //this is like saying, wnv you get a route like this, use the reviewRoutr instead
//and for reviewrouter to get access to the params in this req we use merge Params by heading over to reviewRouter

// router.param('id', checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-plans/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlans,
  );
router //instead of using "app", we use a mounted route, this makes it like the children route
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.CreateNewTour,
  ); //chaining middleware

router
  .route('/:id')
  .get(tourController.getReqTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
