const express = require("express");
const { getReviews, addReview, deleteReview } = require("../controllers/review.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/:productId", getReviews);                        // Public — anyone can read
router.post("/:productId", protect, addReview);               // Consumer only
router.delete("/:productId", protect, deleteReview);          // Consumer — delete own review

module.exports = router;
