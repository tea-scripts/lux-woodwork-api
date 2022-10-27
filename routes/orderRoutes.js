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
  archiveOrder,
  unarchiveOrder,
  shipOrder,
  deliveredOrder,
} = require('../controllers/orderController');
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

router
  .route('/')
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermissions('admin'), getAllOrders);

router.route('/show-my-orders/:id').get(authenticateUser, getUserOrders);

router
  .route('/:id')
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder)
  .delete(authenticateUser, authorizePermissions('admin'), deleteOrder);

router
  .route('/archive/:id')
  .patch(authenticateUser, authorizePermissions('admin'), archiveOrder);

router
  .route('/unarchive/:id')
  .patch(authenticateUser, authorizePermissions('admin'), unarchiveOrder);

router.route('/cancel/:id').patch(authenticateUser, cancelOrder);

router
  .route('/ship/:id')
  .patch(authenticateUser, authorizePermissions('admin'), shipOrder);

router
  .route('/deliver/:id')
  .patch(authenticateUser, authorizePermissions('admin'), deliveredOrder);

module.exports = router;
