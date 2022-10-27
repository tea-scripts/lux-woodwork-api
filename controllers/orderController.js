const Order = require('../models/Order');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const sendOrderConfirmationEmail = require('../utils/sendOrderConfirmationEmail');
const sendShippingEmail = require('../utils/sendShippingEmail');
const sendOrderDeliveredEmail = require('../utils/sendOrderDeliveredEmail');

const createOrder = async (req, res) => {
  const { cartItems, tax, shippingFee, defaultAddress } = req.body;

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
    const { name, price, images, _id } = dbProduct;
    const singleOrderItem = {
      quantity: item.quantity,
      name,
      price,
      image: images[0],
      product: _id,
    };

    // add item to order
    orderItems = [...orderItems, singleOrderItem];

    // calculate subtotal
    subtotal += item.quantity * price;
  }
  // calculate total
  const total = tax + shippingFee + subtotal;

  const user = await User.findOne({ _id: req.user.userId });
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.user.userId}`);
  }

  const userEmail = user.email;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: 'php',
    description: 'Lux Woodwork Store',
    payment_method: 'pm_card_visa',
    payment_method_types: ['card'],
    receipt_email: userEmail,
  });

  const expiryDate = new Date();

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
    shippingAddress: defaultAddress,
    expiryDate: expiryDate.setDate(expiryDate.getDate() + 5),
  });

  setTimeout(async () => {
    await Order.findOneAndUpdate(
      { _id: order._id },
      { status: 'cancelled', expiryDate: null },
      { new: true }
    );
  }, 1000 * 60 * 60 * 24 * 5);

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: paymentIntent.clientSecret });
};

const getUserOrders = async (req, res) => {
  const limit = 5;
  const page = Number(req.query.page) || 1;
  const { id } = req.params;

  checkPermissions(req.user, id);

  const count = await Order.countDocuments({ user: req.user.userId });

  const orders = await Order.find({ user: req.user.userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(limit * (page - 1));

  res
    .status(StatusCodes.OK)
    .json({ orders, count: orders.length, pages: Math.ceil(count / limit) });
};

const getSingleOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${req.params.id}`);
  }

  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getAllOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalOrders = await Order.countDocuments();
  const totalPages = Math.ceil(totalOrders / limit);

  const orders = await Order.find({})
    .populate('user', 'phone  email first_name last_name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res
    .status(StatusCodes.OK)
    .json({ orders, totalPages, totalOrders, count: orders.length });
};

const updateOrder = async (req, res) => {
  const { paymentIntentId } = req.body;
  const order = await Order.findOne({ _id: req.params.id });

  const user = await User.findOne({ _id: req.user.userId });
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.user.userId}`);
  }

  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${req.params.id}`);
  }

  checkPermissions(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = 'paid';
  order.expiryDate = null;

  await order.save();

  await sendOrderConfirmationEmail({
    username: user.username,
    email: user.email,
    order,
    origin: 'http://localhost:3000',
  });

  const updateInventory = async () => {
    const promises = order.orderItems.map(async (item) => {
      const product = await Product.findOne({ _id: item.product });
      product.inventory -= item.quantity;
      await product.save();
    });

    await Promise.all(promises);
  };

  await updateInventory();

  res.status(StatusCodes.OK).json({ order });
};

const deleteOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${req.params.id}`);
  }

  order.isDeleted = true;
  await order.save();
  res.status(StatusCodes.OK).json({ order });
};

const cancelOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${req.params.id}`);
  }

  checkPermissions(req.user, order.user);

  order.status = 'cancelled';
  order.expiryDate = null;

  await order.save();

  res.status(StatusCodes.OK).json({ msg: 'Order cancelled' });
};

const archiveOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${req.params.id}`);
  }

  order.isArchived = true;
  await order.save();
  res.status(StatusCodes.OK).json({ msg: 'Order archived' });
};

const unarchiveOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${req.params.id}`);
  }

  order.isArchived = false;
  await order.save();
  res.status(StatusCodes.OK).json({ msg: 'Order unarchived' });
};

const shipOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${req.params.id}`);
  }

  order.isShipped = true;
  await order.save();
  await sendShippingEmail({
    first_name: order.user.first_name,
    email: order.user.email,
    order,
    origin: 'http://localhost:3000',
  });

  res.status(StatusCodes.OK).json({ msg: 'Order shipped' });
};

const deliveredOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${req.params.id}`);
  }

  order.isDelivered = true;

  sendOrderDeliveredEmail({
    first_name: order.user.first_name,
    email: order.user.email,
    order,
    origin: 'http://localhost:3000',
  });
  await order.save();
  res.status(StatusCodes.OK).json({ msg: 'Order delivered' });
};

module.exports = {
  createOrder,
  getUserOrders,
  getSingleOrder,
  getAllOrders,
  updateOrder,
  deleteOrder,
  cancelOrder,
  archiveOrder,
  unarchiveOrder,
  shipOrder,
  deliveredOrder,
};
