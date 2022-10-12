const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const stripeController = async (req, res) => {
  const { purchase, amount, id } = req.body;

  const calculateOrderAmount = () => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1400;
  };

  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(),
    currency: 'php',
    description: 'Lux Woodwork',
    confirm: true,
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
};

module.exports = stripeController;
