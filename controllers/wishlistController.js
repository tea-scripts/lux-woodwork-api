const Wishlist = require('../models/Wishlist');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const addWishlistItem = async (req, res) => {
    const { id: product } = req.body;
    
    const alreadyAdded = await Wishlist.findOne({
        product,
        userId: req.user.userId,
    });
    
    if (alreadyAdded) {
        throw new CustomError.BadRequestError('Already added to wishlist');
    }
    
    req.body.userId = req.user.userId;
    const wishlistItem = await Wishlist.create({
        product,
        userId: req.user.userId,
    });
    res.status(StatusCodes.CREATED).json({ wishlistItem });
}

const getUserWishlist = async (req, res) => {
    const {id} = req.params;

    checkPermissions(req.user, id);

    const userWishlist = await Wishlist.find({userId: id}).populate({
        path: 'product',
        select: 'name image price featured description',    
    });

    res.status(StatusCodes.OK).json({userWishlist, count: userWishlist.length});
}

const deleteWishliistItem = async (req, res) => {
    const {id} = req.params;

    const wishlistItem = await Wishlist.findOne({_id: id});
    
    if (!wishlistItem) {
        throw new CustomError.NotFoundError(`No wishlist item with id: ${id}`);
    }

    checkPermissions(req.user, wishlistItem.userId);

    await Wishlist.findOneAndDelete({_id: id});

    res.status(StatusCodes.OK).json({msg: 'Wishlist item deleted successfully'});
}

module.exports = {
    addWishlistItem,
    getUserWishlist,    
    deleteWishliistItem,
};