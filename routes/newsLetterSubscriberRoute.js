const express = require('express');
const router = express.Router();
const {
  subscribeToNewsletter,
  getAllSubscribers,
  deleteSubscriber,
} = require('../controllers/newsLetterSubscriberController');

router.route('/').post(subscribeToNewsletter).get(getAllSubscribers);
router.route('/:id').delete(deleteSubscriber);

module.exports = router;
