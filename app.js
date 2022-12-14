require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const bodyParser = require("body-parser");
const fs = require("fs");

// DB Connection
const connectDB = require("./db/connect");

// Middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const allowedOrigins = [
  "https://adal-front.herokuapp.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5000",
  "https://adal-backend.herokuapp.com",
  "https://lux-woodwork-store.netlify.app",
  "https://lux-woodwork-api.onrender.com",
  "https://lux-woodwork.onrender.com",
];

if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

const upload = multer({
  storage: storage,
  faceFilter: fileFilter,
});

// Routes
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const addressRouter = require("./routes/addressRoutes");
const productRouter = require("./routes/productRoutes");
const orderRouter = require("./routes/orderRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const wishlistRouter = require("./routes/wishlistRoutes");
const newsLetterRouter = require("./routes/newsLetterSubscriberRoute");
const contactUsRouter = require("./routes/contactUsRoutes");
const supportTicketRouter = require("./routes/supportTicketRoutes");

app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.get("/", (req, res) => {
  res.send("Lux Woodwork API");
});

// User Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/address", addressRouter);
app.use("/api/v1/wishlist", wishlistRouter);

// Product Routes
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/reviews", reviewRouter);

// NewsLetter Route
app.use("/api/v1/newsletter", newsLetterRouter);

// Contact Us Route
app.use("/api/v1/contact-us", contactUsRouter);

// Support Ticket Route
app.use("/api/v1/support-ticket", supportTicketRouter);

// Cloudinary Route
const uploadToCloudinary = async (localPath) => {
  const mainFolderName = "lux-woodwork-product-images";
  return cloudinary.uploader
    .upload(localPath, { folder: mainFolderName })
    .then((result) => {
      fs.unlinkSync(localPath);
      return {
        url: result.url,
      };
    })
    .catch((err) => {
      fs.unlinkSync(localPath);
      return {
        error: err,
      };
    });
};

app.post("/api/v1/uploadImage", upload.array("image"), async (req, res) => {
  let urls = [];

  for (const file of req.files) {
    const { path } = file;
    const newPath = await uploadToCloudinary(path);
    urls.push(newPath);
  }

  res.status(200).json({
    msg: "images uploaded successfully",
    images: urls,
  });
});

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
