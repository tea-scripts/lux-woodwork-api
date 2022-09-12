require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();

// DB Connection
const connectDB = require('./db/connect');

app.get('/', (req, res) => {
  res.send('Lux Woodwork API');
});

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error(err);
  }
};

start();
