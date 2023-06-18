require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require('cors')
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const swaggerUi = require("swagger-ui-express");
const helmet = require("helmet");
const xss = require("xss-clean");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
const connectDb = require("./db/connectdb");

// routers
const userRouter = require("./routes/userRouter");
const productRouter = require("./routes/productRouter");
const reviewRouter = require("./routes/reviewRouter");
const vendorRouter = require("./routes/vendorRouter");
const orderRouter = require("./routes/orderRouter")

// middlewares
const errorHandlerMiddleware = require('./middleware/error-handler')
const notFound = require("./middleware/not-found");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API,
  api_secret: process.env.CLOUD_SECRET,
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SECRET));
app.use(fileUpload({ useTempFiles: true }));
app.use(helmet());
app.use(cors());
app.use(xss());

//swagger ui
//const swaggerDocument = require("./swagger.json");
app.get("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//test route
app.get("/", (req, res, next) => {
  res.send("This is the home page");
});

//app routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/vendors", vendorRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter)

app.use(notFound);
app.use(errorHandlerMiddleware)

const PORT = process.env.PORT || 5000;
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`App listening on port: ${PORT}`);
  });
})
.catch((error) => {
  console.log(error);
})
