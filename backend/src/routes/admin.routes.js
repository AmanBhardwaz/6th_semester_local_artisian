const express = require("express");
const router  = express.Router();
const { protect, adminOnly } = require("../middleware/auth.middleware");
const {
    getStats,
    getProducts, approveProduct, rejectProduct,
    getUsers, banUser, unbanUser,
    getAllOrders,
} = require("../controllers/admin.controller");

// All admin routes require: valid JWT + admin role
router.use(protect, adminOnly);

router.get("/stats",                 getStats);

router.get("/products",              getProducts);
router.put("/products/:id/approve",  approveProduct);
router.put("/products/:id/reject",   rejectProduct);

router.get("/users",                 getUsers);
router.put("/users/:id/ban",         banUser);
router.put("/users/:id/unban",       unbanUser);

router.get("/orders",                getAllOrders);

module.exports = router;
