const express = require("express");
const cors = require('cors')
const errorHandlerMiddleware = require('./middleware/error-handler')
const app = express();
require("dotenv").config();
require("express-async-errors");

// cors headers

app.use(cors())

//other packages
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");

//database
let DATABASE_URL
if (process.env.NODE_ENV === 'development') {
  DATABASE_URL = process.env.DEV_DATABASE_URL
}
if (process.env.NODE_ENV === 'test') {
  DATABASE_URL = process.env.TEST_DATABASE_URL
}
if (process.env.NODE_ENV === 'production') {
  DATABASE_URL = process.env.DATABASE_URL
}
const connectDb = require("./db/connectdb");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API,
  api_secret: process.env.CLOUD_SECRET,
});

//routers
const userRouter = require("./routes/userRouter");
const productRouter = require("./routes/productRouter");
const reviewRouter = require("./routes/reviewRouter");
const orderRouter = require("./routes/orderRouter")
const vendorRouter = require("./routes/vendorRouter")

const notFound = require("./middleware/not-found");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SECRET));
app.use(fileUpload({ useTempFiles: true }));

//app routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter)
app.use("/api/v1/vendors", vendorRouter)

//test route
app.get("/", (req, res, next) => {
  res.send("This is the home page");
});

app.use(notFound);
app.use(errorHandlerMiddleware)

const PORT = process.env.PORT || 5000;
connectDb(DATABASE_URL);
app.listen(PORT, () => {
  console.log(`App listening on port: ${PORT}`);
});
