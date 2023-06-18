require("dotenv").config();
const mongoose = require("mongoose");

const NODE_ENV = process.env.NODE_ENV || 'development'

//database
let DATABASE_URL
if (NODE_ENV === 'development') {
  DATABASE_URL = process.env.DEV_DATABASE_URL
}
if (NODE_ENV === 'test') {
  DATABASE_URL = process.env.TEST_DATABASE_URL
}
if (NODE_ENV === 'production') {
  DATABASE_URL = process.env.DATABASE_URL
}

const connectDb = async (url) => {
  try {
    await mongoose.connect(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`database connected successfully}`);
  } catch (error) {
    console.log(`Failed to connect to database. ${error}`);
    process.exit(1);
  }
};

module.exports = connectDb;
