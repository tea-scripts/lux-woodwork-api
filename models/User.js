const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const validator = require('validator');

const UserSchema = new Schema(
  {
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: 'Please enter a valid email address',
      },
    },
    username: {
      type: String,
      unique: true,
      minlength: [6, 'Minimum username length is 6 characters'],
      required: [true, 'Please provide a username'],
    },
    address: [
      {
        street: {
          type: String,
          default: '',
        },
        city: {
          type: String,
          default: '',
        },
        state: {
          type: String,
          default: '',
        },
        zip: {
          type: String,
          default: '',
        },
      },
    ],
    phone: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Minimum password length is 6 characters'],
    },
    verificationToken: {
      type: String,
    },
    verified: {
      type: Date,
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model('User', UserSchema);
