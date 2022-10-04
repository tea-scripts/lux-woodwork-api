const CustomError = require('../errors');
const Token = require('../models/Token');
const { isTokenValid, attachCookiesToResponse } = require('../utils');

const authenticateUser = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;

  try {
    if (accessToken) {
      const { user } = isTokenValid(accessToken);
      req.user = user;
      return next();
    }

    const paylaod = isTokenValid(refreshToken);
    const existingToken = await Token.findOne({
      user: paylaod.user.userId,
      refreshToken: paylaod.refreshToken,
    });

    if (!existingToken || !existingToken?.isValid) {
      throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }

    attachCookiesToResponse({
      res,
      user: paylaod.user,
      refreshToken: existingToken.refreshToken,
    });

    req.user = paylaod.user;
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

// Set Permissions
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }

    next();
  };
};

module.exports = { authorizePermissions, authenticateUser };
