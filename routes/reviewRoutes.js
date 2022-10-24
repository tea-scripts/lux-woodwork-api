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
  .patch(authenticateUser, authorizePermissions('admin'), archiveReview)
  .patch(authenticateUser, authorizePermissions('admin'), unarchiveReview)
  .patch(authenticateUser, deleteReview);

router.route('/user/:id').get(authenticateUser, getUserReviews);

module.exports = router;
