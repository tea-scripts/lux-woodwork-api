const express = require('express');
const router = express.Router();
const {
  subscribeToNewsletter,
  getAllSubscribers,
  deleteSubscriber,
  unsubscribeFromNewsletter,
} = require('../controllers/newsLetterSubscriberController');

router.route('/').post(subscribeToNewsletter).get(getAllSubscribers);
router.route('/:id').delete(deleteSubscriber);
router.route('/unsubscribe').post(unsubscribeFromNewsletter);

module.exports = router;
