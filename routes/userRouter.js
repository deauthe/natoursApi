const express = require('express');
const userController = require('./../controllers/userController.js');
const authController = require('./../controllers/authController.js');
const reviewController = require('./../controllers/reviewController.js');

const router = express.Router();

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getReqUser,
);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);

router.use(authController.protect); //this protects all routes below and the positioning in code for this is super important

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
);
router.delete('/deleteMe', userController.deleteMe);
router.route('/').get(userController.getAllusers);
router.patch('/updateMe', userController.updateMe);

router.use(authController.restrictTo('admin'));

router
  .route('/:id')
  .get(userController.getReqUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
