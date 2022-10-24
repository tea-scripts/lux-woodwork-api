const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');
const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  archiveProduct,
  unarchiveProduct,
} = require('../controllers/productController');
const { getSingleProductReviews } = require('../controllers/reviewController');

router
  .route('/')
  .post(authenticateUser, authorizePermissions('admin'), createProduct)
  .get(getAllProducts);

router
  .route('/:id')
  .get(getSingleProduct)
  .patch(authenticateUser, authorizePermissions('admin'), updateProduct)
  .delete(authenticateUser, authorizePermissions('admin'), deleteProduct);

router
  .route('/archive/:id')
  .patch(authenticateUser, authorizePermissions('admin'), archiveProduct);

router
  .route('/unarchive/:id')
  .patch(authenticateUser, authorizePermissions('admin'), unarchiveProduct);

router.route('/:id/reviews').get(getSingleProductReviews);

module.exports = router;
