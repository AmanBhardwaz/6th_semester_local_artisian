const Review = require("../models/Review");

// GET /api/reviews/:productId — get all reviews for a product
exports.getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate("consumer", "name profilePhoto")
            .sort({ createdAt: -1 });

        // Calculate average rating
        const avg = reviews.length
            ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        res.json({ reviews, avgRating: parseFloat(avg), totalReviews: reviews.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/reviews/:productId — add or update review (consumer only)
exports.addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5)
            return res.status(400).json({ message: "Rating must be between 1 and 5" });

        // Upsert — update if exists, insert if not
        const review = await Review.findOneAndUpdate(
            { product: req.params.productId, consumer: req.user.id },
            { rating, comment },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json({ message: "Review saved!", review });
    } catch (err) {
        console.error("Review error:", err.message);
        // Handle duplicate key error gracefully
        if (err.code === 11000) {
            return res.status(400).json({ message: "You have already reviewed this product." });
        }
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/reviews/:productId — delete own review
exports.deleteReview = async (req, res) => {
    try {
        await Review.findOneAndDelete({
            product: req.params.productId,
            consumer: req.user.id,
        });
        res.json({ message: "Review deleted." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
