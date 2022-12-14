const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const crypto = require('crypto');
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
} = require('../utils');

const register = async (req, res) => {
  const { email, password, username } = req.body;
  const emailExists = await User.findOne({ email });

  if (emailExists) {
    throw new CustomError.BadRequestError('Email already exists');
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const verificationToken = crypto.randomBytes(45).toString('hex');

  const env = process.env.NODE_ENV || 'development';

  const origin =
    env === 'development'
      ? 'http://localhost:3000'
      : 'https://lux-woodwork.onrender.com';

  const user = await User.create({
    email,
    password,
    role,
    username,
    verificationToken,
  });

  await sendVerificationEmail({
    username: user.username,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });

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
  const { username, password } = req.body;
  if (!username || !password) {
    throw new CustomError.BadRequestError(
      'Please provide username and password'
    );
  }

  const user = await User.findOne({ username });
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

  const token = user.createJWT();
  res.status(StatusCodes.OK).json({ user, token });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError('Please provide email');
  }

  const user = await User.findOne({ email });

  /* 
  Sending email even if user doesn't exist 
  To prevent user enumeration attacks

  i.e If user exists, send email to user with reset password link 
  If user doesn't exist, send response to user with message "If user exists, email has been sent"
  */

  if (user) {
    const passwordToken = crypto.randomBytes(45).toString('hex');

    const env = process.env.NODE_ENV || 'development';

    const origin =
      env === 'development'
        ? 'http://localhost:3000'
        : 'https://lux-woodwork.onrender.com';

    await sendResetPasswordEmail({
      username: user.username,
      email: user.email,
      token: passwordToken,
      origin,
    });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;

    await user.save();
  }

  res.status(StatusCodes.OK).json({ msg: 'Password Reset Email sent' });
};

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  if (!email || !password || !token) {
    throw new CustomError.BadRequestError('Please provide all fields');
  }
  const user = await User.findOne({ email });

  if (user) {
    const currentDate = Date.now();

    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;

      await user.save();
    }
  }

  res.send('Password Reset Successful');
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
