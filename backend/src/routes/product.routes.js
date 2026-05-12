const express = require("express");
const router = express.Router();
const upload = require("../utils/upload");
const { protect } = require("../middleware/auth.middleware");
const { browseLimiter } = require("../middleware/rateLimiter");
const { getRecommendations } = require("../services/recommendation.service");
const {
    createProduct, getMyProducts, getAllProducts,
    getProductById, deleteProduct, updateProduct
} = require("../controllers/product.controller");

// ⚠️ Specific routes MUST come before /:id (parameterized) routes
// otherwise Express matches /my as /:id with id="my"

// Public
router.get("/",           browseLimiter, getAllProducts);
router.get("/recommended",browseLimiter, async (req, res) => {
    try {
        const limit   = Math.min(parseInt(req.query.limit) || 20, 50);
        const results = await getRecommendations(limit);
        res.json(results.map(r => ({
            ...r.product.toObject(),
            _meta: {
                score:          Math.round(r.finalScore),
                popularityScore:Math.round(r.popularityScore),
                discoveryScore: Math.round(r.discoveryScore),
                isNew:          r.isNew,
                isTrending:     r.isTrending,
                avgRating:      r.avgRating,
                reviewCount:    r.reviewCount,
            },
        })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Protected — must be before /:id
router.post("/create", protect, upload.single("image"), createProduct);
router.get("/my",      protect, getMyProducts);

// Parameterized — always last
router.get("/:id",    browseLimiter, getProductById);
router.delete("/:id", protect, deleteProduct);
router.put("/:id",    protect, updateProduct);

module.exports = router;


