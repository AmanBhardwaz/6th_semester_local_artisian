const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
    createRazorpayOrder,
    verifyPayment,
    placeOrder,
    getMyOrders,
    getArtisanOrders,
    updateOrderStatus,
} = require("../controllers/order.controller");

// Razorpay — Step 1: create a Razorpay order & get orderId + key
router.post("/create-razorpay-order", protect, createRazorpayOrder);

// Razorpay — Step 2: verify signature & save order to DB
router.post("/verify-payment", protect, verifyPayment);

// Legacy / fallback
router.post("/place", protect, placeOrder);

router.get("/my", protect, getMyOrders);
router.get("/artisan", protect, getArtisanOrders);
router.put("/:id/status", protect, updateOrderStatus);

module.exports = router;

