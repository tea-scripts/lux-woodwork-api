const sendEmail = require('./sendEmail');

const sendOrderConfirmationEmail = async ({
  username,
  email,
  order,
  origin,
}) => {
  const formatPrice = (number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
    }).format(number / 100);
  };

  const orderUrl = `${origin}/orders/${order._id}`;
  const message = `
  <div>
  <p>Thank you! Your order has been confirmed.</p>
  <p>Order ID: ${order._id}</p>
  <p>Order Status: ${order.status}</p>
  <p>Shipping : </p>
  <p style='max-width: 30rem'> ${order.shippingAddress.street}, ${
    order.shippingAddress.barangay
  } ${order.shippingAddress.city} ${order.shippingAddress.province}, ${
    order.shippingAddress.postalCode
  }, ${order.shippingAddress.region} PH.</p>
  <p>Order Items:</p>
  <ul>
  ${order.orderItems
    .map(
      (item) => `
    <li>
      <p>Name: ${item.name}</p>
      <p>Quantity: ${item.quantity}</p>
      <p>Price: ${formatPrice(item.priceWithVAT)}</p>
    </li>
    `
    )
    .join('')}
  </ul>
  <p>Subtotal: ${formatPrice(order.subtotal)}</p>
  <p>Tax: ${formatPrice(order.tax)}</p>
  <p>Shipping Fee: ${formatPrice(order.shippingFee)}</p>
  <p>Total: ${formatPrice(order.total)}</p>

  
  <p>Please click the following link to view your order : <a style="font-weight: bold" href="${orderUrl}">View Order</a></p>
  </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Order Confirmation',
    html: `<h4>Hi ${username}</h4>
    <div style='margin: 0 auto'>
    ${message}
    </div>
    `,
  });
};

module.exports = sendOrderConfirmationEmail;
