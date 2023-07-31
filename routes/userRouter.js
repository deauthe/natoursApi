const express = require('express');
const {
  getAllusers,
  createNewUser,
  getReqUser,
  updateUser,
  deleteUser,
} = require('./../controllers/userController.js');

const router = express.Router();

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
