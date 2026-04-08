const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
    placeOrder,
    getMyOrders,
    getArtisanOrders,
    updateOrderStatus,
} = require("../controllers/order.controller");

router.post("/place", protect, placeOrder);
router.get("/my", protect, getMyOrders);
router.get("/artisan", protect, getArtisanOrders);
router.put("/:id/status", protect, updateOrderStatus);

module.exports = router;
