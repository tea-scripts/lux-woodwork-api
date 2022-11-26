const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');

const NewsLetterSubscriberSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: 'Please enter a valid email address',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  'NewsLetterSubscriber',
  NewsLetterSubscriberSchema
);
