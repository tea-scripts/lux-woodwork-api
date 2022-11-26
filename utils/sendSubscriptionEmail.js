const sendEmail = require('./sendEmail');

const sendSubscriptionEmail = async ({ email }) => {
  const message = `
  <div>
  <p>Thank you for subscribing to our newsletter!</p>
  <p>You will receive updates on our latest products and promos!</p>
  </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Subscription Confirmation',
    html: `<h4>Hi there!</h4>
    <div style='margin: 0 auto'>
    ${message}
    </div>
    `,
  });
};

module.exports = sendSubscriptionEmail;
