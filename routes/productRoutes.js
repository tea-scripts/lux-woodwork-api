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
} = require('../controllers/productController');
const { uploadImage } = require('../controllers/uploadImageController');

router
  .route('/')
  .post(authenticateUser, authorizePermissions('admin'), createProduct)
  .get(getAllProducts);

router.post('/uploadImage', authenticateUser, uploadImage);

router
  .route('/:id')
  .get(getSingleProduct)
  .patch(authenticateUser, authorizePermissions('admin'), updateProduct)
  .delete(authenticateUser, authorizePermissions('admin'), deleteProduct);

module.exports = router;
