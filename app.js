require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
// DB Connection
const connectDB = require('./db/connect');

// Middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// Routes
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');

app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.get('/', (req, res) => {
  res.send('Lux Woodwork API');
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

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
