const Order = require('../models/Order');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const stripe = require('stripe')(
  'sk_test_51LRc6LBAIWKWcynMUdBp4qUpCx1sTqdFmWqS717kOJFeCkomm7RV4EZEdBGnG650hA1ts9aCjQv8vYNDijmrtttG00hgHNBH3M'
);

const createOrder = async (req, res) => {
  const { cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError('No cart items provided');
  }
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      'Please provide tax and shipping fee'
    );
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item._id });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(`No product with id : ${item._id}`);
    }
    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    // add item to order
    orderItems = [...orderItems, singleOrderItem];

    // calculate subtotal
    subtotal += item.amount * price;
  }
  // calculate total
  const total = tax + shippingFee + subtotal;

  /*
   * Will Setup Payment Intent/Gateway Here
   */

  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: 'php',
    description: 'Lux Woodwork Store',
    confirm: true,
    payment_method: 'pm_card_visa',
    payment_method_types: ['card'],
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: paymentIntent.clientSecret });
};

const getUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders });
};

const getSingleOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${req.params.id}`);
  }
  res.status(StatusCodes.OK).json({ order });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders });
};

const updateOrder = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findOne({ _id: req.params.id });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${req.params.id}`);
  }

  checkPermissions(req.user, order.user);

  order.status = status;
  await order.save();
  res.status(StatusCodes.OK).json({ order });
};

const deleteOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${req.params.id}`);
  }

  checkPermissions(req.user, order.user);

  await order.remove();
  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  createOrder,
  getUserOrders,
  getSingleOrder,
  getAllOrders,
  updateOrder,
  deleteOrder,
};