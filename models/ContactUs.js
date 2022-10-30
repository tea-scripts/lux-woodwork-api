const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactUsSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
    },
    subject: {
      type: String,
      required: [true, 'Please enter a subject'],
    },
    message: {
      type: String,
      required: [true, 'Please enter a message'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactUs', contactUsSchema);
