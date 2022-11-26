const NewsLetterSubscriber = require('../models/NewsLetterSubscriber');
const { StatusCodes } = require('http-status-codes');
const { sendSubscriptionEmail } = require('../utils');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter
// @access  Public
const subscribeToNewsletter = async (req, res) => {
  const { email } = req.body;
  try {
    await NewsLetterSubscriber.create({
      email,
    });

    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: 'Please provide an email address',
      });
    }

    await sendSubscriptionEmail({ email });

    res.status(StatusCodes.CREATED).json({
      msg: 'Thank you for subscribing to our newsletter!',
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      msg: error.message,
    });
  }
};

const getAllSubscribers = async (req, res) => {
  const subscribers = await NewsLetterSubscriber.find();
  res.status(StatusCodes.OK).json({
    subscribers,
  });
};

const deleteSubscriber = async (req, res) => {
  const { id } = req.params;
  await NewsLetterSubscriber.findByIdAndDelete(id);
  res.status(StatusCodes.OK).json({
    msg: 'Subscriber deleted',
  });
};

module.exports = {
  subscribeToNewsletter,
  getAllSubscribers,
  deleteSubscriber,
};
