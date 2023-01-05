const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');
const {
  createQuery,
  getQueries,
  resolveQuery,
  deleteQuery,
  cancelQuery,
} = require('../controllers/contactUsController');

router
  .route('/')
  .post(createQuery)
  .get(authenticateUser, authorizePermissions('admin'), getQueries);

router
  .route('/:id')
  .patch(authenticateUser, authorizePermissions('admin'), resolveQuery)
  .delete(authenticateUser, authorizePermissions('admin'), deleteQuery);

router.route('/cancel/:id').patch(authenticateUser, cancelQuery);

module.exports = router;
