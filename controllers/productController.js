const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const products = await Product.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalProducts = await Product.countDocuments();
  const totalPages = Math.ceil(totalProducts / limit);

  res
    .status(StatusCodes.OK)
    .json({ products, totalPages, totalProducts, count: products.length });
};

const getSingleProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne({ _id: id }).populate('reviews');
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${id}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const archiveProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne({ _id: id });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${id}`);
  }

  product.isArchived = true;
  product.displayProduct = false;
  await product.save();

  res.status(StatusCodes.OK).json({ msg: 'Product Archived Successfully' });
};

const unarchiveProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne({ _id: id });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${id}`);
  }

  product.isArchived = false;
  await product.save();

  res.status(StatusCodes.OK).json({ msg: 'Product Unarchived Successfully' });
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne({ _id: id });
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${id}`);
  }

  const updatedProduct = await Product.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({ updatedProduct });
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne({ _id: id });
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${id}`);
  }

  product.isDeleted = true;
  product.displayProduct = false;
  await product.save();

  res.status(StatusCodes.OK).json({ msg: 'Product Deleted Successfully' });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  archiveProduct,
  unarchiveProduct,
};
