const Review = require('../models/Review');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const Order = require('../models/Order');

const createReview = async (req, res) => {
  const { product: productId } = req.body;

  const isValidProduct = await Product.findOne({ _id: productId });

  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      'Already submitted review for this product'
    );
  }

  // find productId in the orderItems
  const alreadyBought = await Order.findOne({
    user: req.user.userId,
    orderItems: { $elemMatch: { product: productId } },
  });

  if (!alreadyBought) {
    throw new CustomError.BadRequestError(
      'You have not bought this product yet'
    );
  }

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find()
    .populate({
      path: 'user',
      select: 'username first_name last_name',
    })
    .populate({
      path: 'product',
      select: 'name',
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalReviews = await Review.countDocuments();
  const totalPages = Math.ceil(totalReviews / limit);

  res
    .status(StatusCodes.OK)
    .json({ reviews, totalPages, totalReviews, count: reviews.length });
};

const getUserReviews = async (req, res) => {
  const limit = 5;
  const page = Number(req.query.page) || 1;
  const { id } = req.params;

  checkPermissions(req.user, id);

  const count = await Review.countDocuments({ user: id });

  const userReviews = await Review.find({ user: req.user.userId })
    .populate('product', 'name images')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(limit * (page - 1));

  res.status(StatusCodes.OK).json({
    userReviews,
    count: userReviews.length,
    pages: Math.ceil(count / limit),
  });
};

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId }).populate('product', 'name images');

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
  }

  checkPermissions(req.user, review.user);

  review.rating = rating;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
  }

  checkPermissions(req.user, review.user);

  review.isDeleted = true;
  await review.save();

  res.status(StatusCodes.OK).json({ msg: 'Success! Review removed' });
};

const getSingleProductReviews = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId })
    .populate({
      path: 'user',
      select: 'username first_name last_name',
    })
    .skip(skip)
    .limit(limit);

  const totalReviews = await Review.countDocuments({ product: productId });
  const totalPages = Math.ceil(totalReviews / limit);

  res
    .status(StatusCodes.OK)
    .json({ reviews, totalPages, totalReviews, count: reviews.length });
};

const archiveReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
  }

  review.isArchived = true;
  await review.save();
  res.status(StatusCodes.OK).json({ msg: 'Success! Review archived' });
};

const unarchiveReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
  }

  review.isArchived = false;
  await review.save();
  res.status(StatusCodes.OK).json({ msg: 'Success! Review unarchived' });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
  getUserReviews,
  archiveReview,
  unarchiveReview,
};
