const sendEmail = require('./sendEmail');

const emailStyles = `
<style>
  .container {
    margin: 0 auto;
    width: 100%;
    max-width: 300px;
    padding: 20px;
  }
  .container p {
    font-size: 1rem;
    font-weight: 400;
    text-align: center;
    margin-bottom: 20px;
  }
</style>
`;

const sendContactUsEmail = async ({
  name,
  email,
  message,
  subject,
  support_type,
  order_id,
  product,
}) => {
  const html = `
  <div>
  <p>You have a new message from ${name}.</p>
  <p>Email: ${email}</p>
  <p>Subject: ${subject}</p>
  <p>Support Type: ${support_type}</p>
  <p>Order ID: ${order_id}</p>
  <p>Product: ${product}</p>
  <p>Message: ${message}</p>
  </div>
  `;

  return sendEmail({
    to: 'luxwoodworkstore@gmail.com',
    subject: 'New Message from Contact Us Form',
    html: `<h4>Hi Admin</h4>
    ${emailStyles}
    <div class='container'>
    ${html}
    </div>
    `,
  });
};

module.exports = sendContactUsEmail;
