const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getSingleOrder,
  getAllOrders,
  updateOrder,
  deleteOrder,
  cancelOrder,
} = require('../controllers/orderController');
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

router
  .route('/')
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermissions('admin'), getAllOrders);

router.route('/show-my-orders').get(authenticateUser, getUserOrders);

router
  .route('/:id')
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder)
  .patch(authenticateUser, cancelOrder)
  .delete(authenticateUser, deleteOrder);

module.exports = router;
