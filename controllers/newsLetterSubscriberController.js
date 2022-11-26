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

    const message = `
  <div>
  <p>Thank you for subscribing to our newsletter!</p>
  <p>You will receive updates on our latest products and promos!</p>
  <a href=${
    process.env.NODE_ENV === 'production'
      ? 'https://lux-woodwork.onrender.com/newsletter/unsubscribe'
      : 'http://localhost:3000/newsletter/unsubscribe'
  }>Unsubscribe</a>
  </div>
  `;

    await sendSubscriptionEmail({
      email,
      subject: 'Subscription Confirmation',
      message,
    });

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

const unsubscribeFromNewsletter = async (req, res) => {
  const { email } = req.body;
  await NewsLetterSubscriber.findOneAndDelete({ email });

  if (!email) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: 'Please provide an email address',
    });
  }

  const message = `
  <div>
  <p>You have been unsubscribed from our newsletter.</p>
  <p>We hope to see you again soon!</p>
  </div>
  `;

  await sendSubscriptionEmail({
    email,
    subject: 'Unsubscription Confirmation',
    message,
  });

  res.status(StatusCodes.OK).json({
    msg: 'You have been unsubscribed from our newsletter',
  });
};

module.exports = {
  subscribeToNewsletter,
  getAllSubscribers,
  deleteSubscriber,
  unsubscribeFromNewsletter,
};
