const mongoose = require("mongoose");
const { MONGO_URI } = require("./env");


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // stop the server if DB fails to connect
  }
};

module.exports = connectDB;
