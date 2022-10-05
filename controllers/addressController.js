const Address = require('../models/Address');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const getAllAddresses = async (req, res) => {
  const addresses = await Address.find({}).select('-password');
  res.status(StatusCodes.OK).json({ addresses, count: addresses.length });
};

const getAllUserAddresses = async (req, res) => {
  const { id } = req.params;

  checkPermissions(req.user, id);

  const userAddresses = await Address.find({ userId: id });
  res
    .status(StatusCodes.OK)
    .json({ userAddresses, count: userAddresses.length });
};

const getSingleAddress = async (req, res) => {
  const { id } = req.params;
  const address = await Address.findOne({ _id: id });
  if (!address) {
    throw new CustomError.NotFoundError(`No address with id: ${id}`);
  }

  checkPermissions(req.user, address.userId);

  res.status(StatusCodes.OK).json({ address });
};

const createAddress = async (req, res) => {
  const address = await Address.create(req.body);
  res.status(StatusCodes.CREATED).json({ address });
};

const updateAddress = async (req, res) => {
  const { id } = req.params;
  const address = await Address.findOne({ _id: id });
  if (!address) {
    throw new CustomError.NotFoundError(`No address with id: ${id}`);
  }

  checkPermissions(req.user, address.userId);

  const updatedAddress = await Address.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  });

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Address Updated Successfully', updatedAddress });
};

const deleteAddress = async (req, res) => {
  const { id } = req.params;
  const address = await Address.findOne({ _id: id });
  if (!address) {
    throw new CustomError.NotFoundError(`No address with id: ${id}`);
  }

  checkPermissions(req.user, address.userId);

  await address.remove();

  res.status(StatusCodes.OK).json({ msg: 'Address Deleted' });
};

module.exports = {
  getAllAddresses,
  getAllUserAddresses,
  getSingleAddress,
  createAddress,
  updateAddress,
  deleteAddress,
};
