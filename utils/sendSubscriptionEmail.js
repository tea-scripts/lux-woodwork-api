const sendEmail = require('./sendEmail');

const sendSubscriptionEmail = async ({ email, subject, message }) => {
  return sendEmail({
    to: email,
    subject,
    html: `<h4>Hi there!</h4>
    <div style='margin: 0 auto'>
    ${message}
    </div>
    `,
  });
};

module.exports = sendSubscriptionEmail;
