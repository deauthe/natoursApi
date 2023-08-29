const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

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
    validate: [
      validator.isEmail,
      'Please provide a valid email',
    ],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [
      true,
      ' please provide a password',
    ],
    minlength: 8,
    select: false, //soo that this never shows up in find methods
  },
  passwordConfirm: {
    type: String,
    required: [
      true,
      'Please confirm you Password',
    ],
    validate: {
      //this only works on save!!
      //this is the acse with all custom validators,
      //this means when a user updates a password it means not only doing findOneAndUpdate() but also a save method because
      //it's not called by default
      validator: function (el) {
        return el === this.password;
      },
      select: false,
    },
  },
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
    return await bcrypt.compare(
      candidatePass,
      userPass,
    );
  };

const User = new mongoose.model(
  'User',
  userSchema,
);

module.exports = User;
