const sendEmail = require('./sendEmail');

const sendContactUsEmail = async ({ name, email, message, subject }) => {
  const html = `
  <div>
  <p>You have a new message from ${name}.</p>
  <p>Email: ${email}</p>
  <p>Subject: ${subject}</p>
  <p>Message: ${message}</p>
  </div>
  `;

  return sendEmail({
    to: 'luxwoodworkstore@gmail.com',
    subject: 'New Message from Contact Us Form',
    html: `<h4>Hi Admin</h4>
    <div style='margin: 0 auto'>
    ${html}
    </div>
    `,
  });
};

module.exports = sendContactUsEmail;
