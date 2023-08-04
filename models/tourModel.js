const mongoose = require('mongoose');
const tourSchema = new mongoose.Schema({
  name: {
    //schema options
    type: String,
    required: [
      true,
      'tour name is a necessary field',
    ], //square brackets for options of options
  },
  rating: Number,
  price: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number,
    required: [
      true,
      ' tour must have a duration',
    ],
  },
  difficulty: {
    type: String,
    required: [
      true,
      'tour must have a diffiulty',
    ],
  },
  ratingsAverage: {
    type: Number,
    default: 4.0,
  },
  ratingsQuantity: {},
  pirceDiscount: {
    type: Number,
  },
  summary: {
    type: String,
    trim: true, //removes the whitespace from beginning and the end
  },
  maxGroupSize: {
    type: Number,
    required: [
      true,
      'a tour must have a max group size',
    ],
  },
  images: [String], //an array of strings,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startdates: [Date], //can deine type without defining it in an object if it's the only argument
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
