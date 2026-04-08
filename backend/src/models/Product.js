const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  image: String,
  category: { type: String, default: "" },
  subCategory: { type: String, default: "" },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
