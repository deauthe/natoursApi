const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name required'],
  },
  email: {
    type: String,
    required: [true, 'please provide email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, ' please provide a password'],
    minlength: 8,
    select: false, //soo that this never shows up in find methods
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm you Password'],
    validate: {
      //this only works on save!!
      //this is the case with all custom validators,
      //this means when a user updates a password it means not only doing findOneAndUpdate() but also a save method because
      //it's not called by default
      validator: function (el) {
        return el === this.password;
      },
      select: false,
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },

  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
});

userSchema.pre(/^find/, function (next) {
  //this points to the current query
  this.find({ active: { $ne: false } });

  next();
});

userSchema.pre('save', async function (next) {
  // only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(
    this.password,
    12, //the amount of complexity we need for hashing, higher means more time  Consuming but more secure, 12 is a good sweet spot
  );
  this.passwordConfirm = undefined; //deleting the confirm password when password is hashed
  //even though it's a required field, it doesnt mean that it needs to persist throughout the database
  next();
});

userSchema.methods.correctPassword = //this is an instance method, read separately
  async function (candidatePass, userPass) {
    //this.password is not recognized here as the field has select:false
    return await bcrypt.compare(candidatePass, userPass);
  };

userSchema.methods.changedPasswordAfterLogin = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = this.passwordChangedAt.getTime() / 1000;
  }

  //this is to convert the date into the same format that jwt writes timestamps at
  // diveded by 1000 to get in seconds rather than miliseconds,
  //the second argument is for the base with which we want to convert the date to int, which is 10 for daily numbers
  if (this.passwordChangedAt) {
    return JWTTimestamp < changedTimeStamp; //checking if the time of change of password is more than the time of issueing of the token
  }
  return false; //default return
};

userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto //creating a randm number to send to user
    .randomBytes(32)
    .toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); //encrypting it as we should not store plain reset tokens in database

  console.log(
    { resetToken },
    {
      passwordResetTokenEnrypted: this.passwordResetToken,
    },
  );

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //adding 10 minutes
  return resetToken; //we return the unencrypted token to send to user and we store the encrypted one in the database to compare it to
};

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; //-1000 accounts for the delay in creation of jwt tokens so shows no error when doing
  next();
});

const User = new mongoose.model('User', userSchema);

module.exports = User;
