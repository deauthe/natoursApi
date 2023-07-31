const express = require('express');

const getAllusers = (req, res) => {
  res.status(500).json({
    status: 'error',
    messsage: 'this path is not yet defined',
  });
};
const createNewUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messsage: 'this path is not yet defined',
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messsage: 'this path is not yet defined',
  });
};
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messsage: 'this path is not yet defined',
  });
};
const getReqUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messsage: 'this path is not yet defined',
  });
};

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
