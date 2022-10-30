const sendEmail = require('./sendEmail');

const sendContactUsEmail = async ({
  name,
  email,
  message,
  subject,
  origin,
}) => {
  const contactUsUrl = `${origin}/contact-us`;
  const html = `
  <div>
  <p>You have a new message from ${name}.</p>
  <p>Email: ${email}</p>
  <p>Subject: ${subject}</p>
  <p>Message: ${message}</p>
  <p>Please click the following link to view the message : <a style="font-weight: bold" href="${contactUsUrl}">View Message</a></p>
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
