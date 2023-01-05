const { CustomAPIError } = require('../errors');
const ContactUs = require('../models/ContactUs');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const Product = require('../models/Product');
const { sendContactUsEmail } = require('../utils');

// Contact Us Route
const createQuery = async (req, res) => {
  const {
    name,
    subject,
    email,
    message,
    support_type,
    order_id,
    product_name,
  } = req.body;
  if (!name || !subject || !email || !message) {
    throw new CustomAPIError.BadRequestError('Please provide all values');
  }

  const emailSent = await ContactUs.create(req.body);
  if (!emailSent) {
    throw new CustomError.BadRequestError('Email not sent');
  }

  const product = await Product.findOne({ _id: product_name });

  await sendContactUsEmail({
    name: name,
    email: email,
    subject: subject,
    origin: req.headers.origin,
    message: message,
    support_type: support_type ? support_type : null,
    order_id: order_id ? order_id : null,
    product: product_name ? product.name : null,
  });

  res.status(200).json({
    emailSent,
    msg: 'Email sent successfully',
  });
};

const getQueries = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const queries = await ContactUs.find()
    .populate({
      path: 'product_name',
      select: 'name',
    })
    .populate({
      path: 'order_id',
      select:
        'order_id orderItems status isShipped isDelivered isCancelled isReceived',
    })
    .skip(skip)
    .limit(limit);

  const totalQueries = await ContactUs.countDocuments();
  const totalPages = Math.ceil(totalQueries / limit);

  res
    .status(StatusCodes.OK)
    .json({ queries, totalPages, totalQueries, count: queries.length });
};

const resolveQuery = async (req, res) => {
  const { id } = req.params;
  const query = await ContactUs.findOne({ _id: id });
  if (!query) {
    throw new CustomError.NotFoundError(`No query with id: ${id}`);
  }

  await ContactUs.findOneAndUpdate(
    { _id: id },
    { status: 'resolved' },
    {
      new: true,
    }
  );

  res.status(StatusCodes.OK).json({ msg: 'Query resolved' });
};

const deleteQuery = async (req, res) => {
  const { id } = req.params;
  const query = await ContactUs.findOne({ _id: id });
  if (!query) {
    throw new CustomError.NotFoundError(`No query with id: ${id}`);
  }

  await ContactUs.findOneAndDelete({
    _id: id,
  });

  res.status(StatusCodes.OK).json({ msg: 'Query deleted' });
};

const cancelQuery = async (req, res) => {
  const { id } = req.params;
  const query = await ContactUs.findOne({ _id: id });
  if (!query) {
    throw new CustomError.NotFoundError(`No query with id: ${id}`);
  }

  await ContactUs.findOneAndUpdate(
    { _id: id },
    { status: 'cancelled' },
    {
      new: true,
    }
  );
};

module.exports = {
  createQuery,
  getQueries,
  resolveQuery,
  deleteQuery,
  cancelQuery,
};
