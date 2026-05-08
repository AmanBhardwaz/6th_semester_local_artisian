const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  image: String,
  category:    { type: String, default: "" },
  subCategory: { type: String, default: "" },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // Admin approval system
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved", // existing products stay live; new ones will be set to "pending"
  },
  adminNote: { type: String, default: "" }, // optional rejection reason
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
