const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      //schema options
      type: String,
      required: [
        //this is a validator
        true,
        'tour name is a necessary field',
      ], //square brackets for options of options
      maxlength: [
        //another validator
        40,
        'tour must have less than 40 characters',
      ],
      minlength: [
        1,
        'tour must have at least 1 character',
      ],
      unique: true,
      // validate: validator.isAlpha(), //this is validation from an ext. module
    },
    rating: {
      type: Number,
      min: [
        0,
        'tour cannot have negative rating',
      ],
      max: [5, "tour's max rating is 5"],
    },
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
      enum: {
        //another validator
        values: ['easy', 'medium', 'difficult'],
        message:
          "difficulty must be either 'easy','medium' or 'difficult'",
      }, //this means the only values that are allowed for this field
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //custom validator
          //this fnc has accesss to the value of this field
          return this.val < this.price;
        },
        message:
          'discount ({VALUE}) should be less than the price', //({value}) is exculsive to mongoose for this involvement
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.0,
      min: [
        0,
        'tour cannot have negative rating',
      ],
      max: [5, "tour's max rating is 5"],
    },
    ratingsQuantity: {
      type: Number,
      min: [
        0,
        'number of ratings cannot be negative',
      ],
    },
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
    slug: [String],
    images: [String], //an array of strings,
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startdates: [String], //can define type without defining it in an object if it's the only argument
    secretTour: {
      //to create a tour that doesn't appear in basic get all tours
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true }, //so that it shows the virtual fields when converted too json
    toObject: { virrtual: true }, //for object data type
  },
);

tourSchema
  .virtual('durationWeeks') //virtual fields, we cannot use these in queries, these are for the user and dev helps
  .get(function () {
    //didn't use arrow function because we needed this keyword
    //uses get because this can only be calculated after we get the data
    return this.duration / 7;
  });

//DOCUMENT MIDDLEWARE: runs before .save() and create()
//this points to the document here

// tourSchema.pre('save', function (next) {
//   this.slug = slugify(this.name, { lower: true }); //adds a new prroperty called slug holding this.name.
//   //this is always referring to the doc just created as pre is a doc middleware and runs before a doc is saved everytime
//   //adding a new property should be done with defining it in the schema first
//   console.log('will save shortly...');
//   next();
// }); //this is mongoose's middleWare, specifically document pre middleWare

// //POST DOC MIDDLEWARE: executes after all premiddlewares have been executed
// tourSchema.post('save', function (doc, next) {
//   console.log(doc); // doc will be the same doc that is being saved and since post executes after pre, it's almost done, so
//   //post gives access to the doc itself in an argument
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  //this way of writing find will trigger all find methods(findOne, findmany, find())
  //this is another regular expression
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  //this points to the query
  console.log(
    `query took : ${
      Date.now() - this.start
    } milliseconds`,
  ); // it is infact the same this that we defined in the pre middleware
  //the query object always remains the same when we use this in mongoose's middlewares, or infact in general as the thing being operated on
  // by the middlewares is the query only
  // console.log(docs);
  next();
});

//AGREGATION MIDDLEWARE:
tourSchema.pre('aggregate', function (next) {
  //this points to the aggregation object
  // console.log(this.pipeline());
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  }); //since this.pipeline() is an array, unshift is a js method to add something at the start of an array.
  //so in the pipeline array we just added another stage.
  //we did this beause even though we hid secrettours from find method, the aggregation pipeline still would inculde the secretTours
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
