const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  attachCookiesToResponse,
  createTokenUser,
  sendEmail,
} = require('../utils');
const crypto = require('crypto');

const register = async (req, res) => {
  const { email, password, username } = req.body;
  const emailExists = await User.findOne({ email });

  if (emailExists) {
    throw new CustomError.BadRequestError('Email already exists');
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const verificationToken = crypto.randomBytes(45).toString('hex');

  const user = await User.create({
    email,
    password,
    role,
    username,
    verificationToken,
  });

  await sendEmail();
  // const tokenUser = createTokenUser(user);
  // attachCookiesToResponse({ res, user: tokenUser });

  // res.status(StatusCodes.CREATED).json({ user: tokenUser });

  res.status(StatusCodes.CREATED).json({
    msg: 'Success! Please check your email to verify your account',
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError('Verification Failed!');
  }

  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError('Verification Failed!');
  }

  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = '';

  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Email Verified' });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Password');
  }

  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError('Please verify your email');
  }

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ msg: 'logged out' });
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
};
