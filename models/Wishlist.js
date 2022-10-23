const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WishlistSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        product: {
            type: Schema.Types.ObjectId,        
            ref: 'Product',
            required: true,
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model('Wishlist', WishlistSchema);