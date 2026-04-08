const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    title: String,
    image: String,
    price: Number,
    quantity: Number,
    artisan: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const orderSchema = new mongoose.Schema({
    consumer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: "UPI" },
    paymentStatus: { type: String, default: "paid" },  // simulated — always paid
    status: {
        type: String,
        enum: ["placed", "processing", "shipped", "delivered"],
        default: "placed",
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
