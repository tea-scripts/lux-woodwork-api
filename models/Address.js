const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    region: {
      type: String,
    },
    province: {
      type: String,
    },
    city: {
      type: String,
    },
    barangay: {
      type: String,
    },
    zip: {
      type: Number,
    },
    street: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Address', AddressSchema);
