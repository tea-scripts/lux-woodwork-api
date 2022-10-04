const sendEmail = require('./sendEmail');

const sendVerificationEmail = async ({
  username,
  email,
  verificationToken,
  origin,
}) => {
  const verificationUrl = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;
  const message = `<p>Please confirm your email by clicking the following link : <a href="${verificationUrl}>Verify Now</a> </p>`;

  return sendEmail({
    to: email,
    subject: 'Verify your email',
    html: `<h4>Hi ${username}</h4>
    <div style='margin: 0 auto'>
    ${message}
    </div>
    `,
  });
};

module.exports = sendVerificationEmail;
