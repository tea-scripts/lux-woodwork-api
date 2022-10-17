const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');
const {
  getAllAddresses,
  getAllUserAddresses,
  getSingleAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  selectDefaultAddress,
} = require('../controllers/addressController');

router
  .route('/')
  .get(authenticateUser, authorizePermissions('admin'), getAllAddresses)
  .post(authenticateUser, createAddress);

router
  .route('/:id')
  .get(authenticateUser, getSingleAddress)
  .patch(authenticateUser, updateAddress)
  .delete(authenticateUser, deleteAddress);

router.route('/default/:id').patch(authenticateUser, selectDefaultAddress);

router.route('/user/:id').get(authenticateUser, getAllUserAddresses);

module.exports = router;
