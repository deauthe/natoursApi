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
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
