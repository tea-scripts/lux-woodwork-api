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
  const { cartItems, shippingFee, defaultAddress } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError('No cart items provided');
  }
  if (!shippingFee) {
    throw new CustomError.BadRequestError('Please provide shipping fee');
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item._id });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(`No product with id : ${item._id}`);
    }
    const { name, priceWithVAT, images, _id } = dbProduct;
    const singleOrderItem = {
      quantity: item.quantity,
      name,
      priceWithVAT,
      image: images[0],
      product: _id,
    };

    // add item to order
    orderItems = [...orderItems, singleOrderItem];

    // calculate subtotal
    subtotal += item.quantity * priceWithVAT;
  }
  // calculate total
  const total = shippingFee + subtotal;

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
  const ordersQueryType = String(req.query.type).toLowerCase() || 'all';
  const { id } = req.params;

  console.log('query type', ordersQueryType);

  checkPermissions(req.user, id);

  let count = 0;
  let orders = [];

  switch (ordersQueryType) {
    case 'pending': {
      count = await Order.countDocuments({
        user: req.user.userId,
        status: 'pending',
      });
      orders = await Order.find({ user: req.user.userId, status: 'pending' })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(limit * (page - 1));
      break;
    }
    case 'paid': {
      count = await Order.countDocuments({
        user: req.user.userId,
        status: 'paid',
      });
      orders = await Order.find({ user: req.user.userId, status: 'paid' })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(limit * (page - 1));
      break;
    }
    case 'cancelled': {
      count = await Order.countDocuments({
        user: req.user.userId,
        status: 'cancelled',
      });
      orders = await Order.find({ user: req.user.userId, status: 'cancelled' })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(limit * (page - 1));
      break;
    }
    case 'delivered': {
      count = await Order.countDocuments({
        user: req.user.userId,
        isDelivered: true,
      });
      orders = await Order.find({ user: req.user.userId, isDelivered: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(limit * (page - 1));
      break;
    }
    default: {
      count = await Order.countDocuments({ user: req.user.userId });
      orders = await Order.find({ user: req.user.userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(limit * (page - 1));
    }
  }

  res
    .status(StatusCodes.OK)
    .json({ orders, count: orders.length, pages: Math.ceil(count / limit) });
};

const getSingleOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id }).populate({
    path: 'user',
    select: 'phone email first_name last_name role',
  });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${req.params.id}`);
  }

  checkPermissions(req.user, order.user._id);
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

  const env = process.env.NODE_ENV || 'development';

  const origin =
    env === 'development'
      ? 'http://localhost:3000'
      : 'https://lux-woodwork.onrender.com';

  await sendOrderConfirmationEmail({
    username: user.username,
    email: user.email,
    order,
    origin,
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

  const user = await User.findOne({ _id: order.user });

  order.isShipped = true;

  const env = process.env.NODE_ENV || 'development';

  const origin =
    env === 'development'
      ? 'http://localhost:3000'
      : 'https://lux-woodwork.onrender.com';

  await sendShippingEmail({
    username: user.username,
    email: user.email,
    order,
    origin,
  });

  await order.save();
  res.status(StatusCodes.OK).json({ msg: 'Order shipped' });
};

const deliveredOrder = async (req, res) => {
  const { proofOfDelivery } = req.body;

  const order = await Order.findOne({ _id: req.params.id });

  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${req.params.id}`);
  }
  const user = await User.findOne({ _id: order.user });

  order.proofOfDelivery = proofOfDelivery;
  order.isDelivered = true;

  const env = process.env.NODE_ENV || 'development';

  const origin =
    env === 'development'
      ? 'http://localhost:3000'
      : 'https://lux-woodwork.onrender.com';

  sendOrderDeliveredEmail({
    username: user.username,
    email: user.email,
    order,
    origin,
  });

  await order.save();

  res.status(StatusCodes.OK).json({ msg: 'Order delivered' });
};

const receiveOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id });

  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${req.params.id}`);
  }

  order.isReceived = true;
  await order.save();
  res.status(StatusCodes.OK).json({ msg: 'Order received' });
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
  receiveOrder,
};
