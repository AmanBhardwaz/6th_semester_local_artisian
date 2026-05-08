const express = require("express");
const router = express.Router();
const upload = require("../utils/upload");
const { protect } = require("../middleware/auth.middleware");
const { browseLimiter } = require("../middleware/rateLimiter");
const {
    createProduct, getMyProducts, getAllProducts,
    getProductById, deleteProduct, updateProduct
} = require("../controllers/product.controller");

// ⚠️ Specific routes MUST come before /:id (parameterized) routes
// otherwise Express matches /my as /:id with id="my"

// Public
router.get("/",   browseLimiter, getAllProducts);

// Protected — must be before /:id
router.post("/create", protect, upload.single("image"), createProduct);
router.get("/my",      protect, getMyProducts);

// Parameterized — always last
router.get("/:id",    browseLimiter, getProductById);
router.delete("/:id", protect, deleteProduct);
router.put("/:id",    protect, updateProduct);

module.exports = router;


