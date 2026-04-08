const mongoose = require("mongoose");
//  also insert data in the database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
    
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
