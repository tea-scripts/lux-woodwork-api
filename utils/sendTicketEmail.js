const sendEmail = require("./sendEmail");

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

const sendTicketEmail = async ({ userId, email, subject, message }) => {
  const html = `
  <div>
  <p>User Id: ${userId}</p>
  <p>Email: ${email}</p>
  <p>Subject: ${subject}</p>
  <p>Message: ${message}</p>
  </div>
  `;

  return sendEmail({
    to: "luxwoodworkstore@gmail.com",
    subject: `[Support Ticket] ${subject}`,
    html: `
    ${emailStyles}
    <div class='container'>
    ${html}
    </div>
    `,
  });
};

module.exports = sendTicketEmail;
