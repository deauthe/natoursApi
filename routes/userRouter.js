const express = require('express');
const {
  getAllusers,
  createNewUser,
  getReqUser,
  updateUser,
  deleteUser,
} = require('./../controllers/userController.js');
const authController = require('./../controllers/authController.js');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router
  .route('/')
  .get(getAllusers)
  .post(createNewUser);

router
  .route('/:id')
  .get(getReqUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
