const CustomError = require('../errors');
const jwt = require('jsonwebtoken');

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid hads');
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: payload.userId,
      role: payload.role,
      username: payload.username,
    };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid hehe');
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
