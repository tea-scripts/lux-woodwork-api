const sendEmail = require('./sendEmail');

const sendResetPasswordEmail = async ({ username, email, token, origin }) => {
  const resetPasswordUrl = `${origin}/user/reset-password?token=${token}&email=${email}`;
  const message = `<p>Please reset your password by clicking the following link : 
    <a style="font-weight: bold" href="${resetPasswordUrl}">Reset Password</a></p>`;

  return sendEmail({
    to: email,
    subject: 'Reset your password',
    html: `<h4>Hi ${username}</h4>
    <div style='margin: 0 auto'>
    ${message}
    </div>
    `,
  });
};

module.exports = sendResetPasswordEmail;
