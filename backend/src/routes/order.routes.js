const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { paymentLimiter } = require("../middleware/rateLimiter");
const {
    createRazorpayOrder,
    verifyPayment,
    placeOrder,
    getMyOrders,
    getArtisanOrders,
    updateOrderStatus,
} = require("../controllers/order.controller");

// Razorpay — strict payment limiter (5 req / 10 min)
router.post("/create-razorpay-order", paymentLimiter, protect, createRazorpayOrder);
router.post("/verify-payment",        paymentLimiter, protect, verifyPayment);

// Legacy / fallback
router.post("/place", protect, placeOrder);

router.get("/my",          protect, getMyOrders);
router.get("/artisan",     protect, getArtisanOrders);
router.put("/:id/status",  protect, updateOrderStatus);

module.exports = router;


