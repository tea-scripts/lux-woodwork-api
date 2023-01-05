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
    product_name: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
    },
    order_id: {
      type: mongoose.Types.ObjectId,
      ref: 'Order',
    },
    support_type: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'closed', 'cancelled'],
      default: 'pending',
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactUs', contactUsSchema);
