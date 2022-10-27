const checkPermissions = require('./checkPermissions');
const sendEmail = require('./sendEmail');
const sendVerificationEmail = require('./sendVerificationEmail');
const sendResetPasswordEmail = require('./sendResetPasswordEmail');
const createHash = require('./createHash');
const sendOrderDeliveredEmail = require('./sendOrderDeliveredEmail');
const sendOrderConfirmationEmail = require('./sendOrderConfirmationEmail');
const sendShippingEmail = require('./sendShippingEmail');

module.exports = {
  checkPermissions,
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
  sendOrderDeliveredEmail,
  sendOrderConfirmationEmail,
  sendShippingEmail,
};
