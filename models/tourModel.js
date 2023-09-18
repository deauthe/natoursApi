const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./../models/userModel');

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
      minlength: [1, 'tour must have at least 1 character'],
      unique: true,
      // validate: validator.isAlpha(), //this is validation from an ext. module
    },
    rating: {
      type: Number,
      min: [0, 'tour cannot have negative rating'],
      max: [5, "tour's max rating is 5"],
    },
    price: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: [true, ' tour must have a duration'],
    },
    difficulty: {
      type: String,
      required: [true, 'tour must have a diffiulty'],
      enum: {
        //another validator
        values: ['easy', 'medium', 'difficult'],
        message: "difficulty must be either 'easy','medium' or 'difficult'",
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
        message: 'discount ({VALUE}) should be less than the price', //({value}) is exculsive to mongoose for this involvement
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.0,
      min: [0, 'tour cannot have negative rating'],
      max: [5, "tour's max rating is 5"],
    },
    ratingsQuantity: {
      type: Number,
      min: [0, 'number of ratings cannot be negative'],
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
      required: [true, 'a tour must have a max group size'],
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
    startLocation: {
      //this is an embedded relationship
      //geoJSON
      type: {
        //this is not the dataType, this is an object named type inside of startLocation
        type: String, //this is the dataType object
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        //notice how this is an array
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        //this is how reference works in mongoose, we dont even need to import User here, it'll just search the model in the database
      },
    ], //getting the guides from this will be done in a pre save middleware if wer'e using embedding, i commented out the code for now,
    //as we will use referencing to not get an overwhelmingly big object when searching a tour
  },
  {
    toJSON: { virtuals: true }, //so that it shows the virtual fields when converted too json
    toObject: { virrtual: true }, //for object data type
  },
);

tourSchema.index({ price: 1, ratingsAverage: -1 }); //1 means ascending order sort to create the index
//creating indexes can reduce query times for fields we query for much often so to search for a price lower than something,
//mongoose just returns the elements below that index rather than going through all and checking
//we can test how many documents were examined before finding result by using the .explain() method on a made query
//note that the indexes take space oon the cloud

tourSchema
  .virtual('durationWeeks') //virtual fields, we cannot use these in queries, these are for the user and dev helps
  .get(function () {
    //didn't use arrow function because we needed this keyword
    //uses get because this can only be calculated after we get the data
    return this.duration / 7;
  });

//virtual populate
tourSchema.virtual('reviews', {
  //name of the field you wanna populate
  ref: 'Review', //name of the Model
  foreignField: 'tour', //the field in the Review model where reference to current model(tourModel) is stored, the ID of the current tour is being stored in this field with ref:
  localField: '_id', //the place in this document where the same thing above is being stored
});

//DOCUMENT MIDDLEWARE: runs before .save() and create()
//this points to the document here

// tourSchema.pre('save', async function (next) { //replacing the guide IDs with  actual guide users in the model, this is embedding
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

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
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt', //removed these fields in the final object
  }); //this goes to the tour model, inside the guides object looks for ref, and finds "ref:User" from there
  //it finds the users associated with the guides array in the tour and replaces their plain IDs with the complete user object
  //even though it's done by referencing, the final output is not different than if it were embedded
  //populating doesn't change the field in the database but alters what the user will see in response objects
  next();
});

tourSchema.pre(/^find/, function (next) {
  //this way of writing find will trigger all find methods(findOne, findmany, find())
  //this is another regular expression
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  //this points to the query
  console.log(`query took : ${Date.now() - this.start} milliseconds`); // it is infact the same this that we defined in the pre middleware
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
