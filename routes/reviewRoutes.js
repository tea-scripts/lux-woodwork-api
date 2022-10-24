const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getUserReviews,
  archiveReview,
  unarchiveReview,
} = require('../controllers/reviewController');

router.route('/').post(authenticateUser, createReview).get(getAllReviews);

router
  .route('/:id')
  .get(getSingleReview)
  .patch(authenticateUser, updateReview)
  .delete(authenticateUser, deleteReview);

router
  .route('/archive/:id')
  .patch(authenticateUser, authorizePermissions('admin'), archiveReview);

router
  .route('/unarchive/:id')
  .patch(authenticateUser, authorizePermissions('admin'), unarchiveReview);

router.route('/user/:id').get(authenticateUser, getUserReviews);

module.exports = router;
