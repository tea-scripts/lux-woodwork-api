const express = require('express');
const { getUserWishlist, addWishlistItem, deleteWishliistItem } = require('../controllers/wishlistController');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');

router.route('/').post(authenticateUser, addWishlistItem);

router.route('/:id').get(authenticateUser, getUserWishlist).delete(authenticateUser, deleteWishliistItem);

module.exports = router;