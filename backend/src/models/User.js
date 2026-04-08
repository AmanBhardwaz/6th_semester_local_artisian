const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: String,
  phone: String,
  profilePhoto: { type: String, default: "" },
  address: {
    street: { type: String, default: "" },
    city:   { type: String, default: "" },
    state:  { type: String, default: "" },
    pincode:{ type: String, default: "" },
  },
  googleId: String,
  role: {
    type: String,
    enum: ["admin", "artisan", "consumer"],
    default: "consumer"
  },
  authProvider: {
    type: [String],
    default: ["local"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
