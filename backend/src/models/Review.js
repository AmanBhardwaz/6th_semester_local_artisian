const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    consumer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
});

// One review per consumer per product
reviewSchema.index({ product: 1, consumer: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
