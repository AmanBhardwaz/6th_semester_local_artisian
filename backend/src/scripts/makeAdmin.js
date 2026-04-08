const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const email = "jai@gmail.com";
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found!");
      process.exit(1);
    }

    
    user.role = "admin";
    await user.save();

    console.log(`Success! User ${user.name} (${user.email}) is now an ADMIN.`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

makeAdmin();
