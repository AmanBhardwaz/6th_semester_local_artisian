/**
 * Recommendation Service — 70:30 Algorithm
 *
 * Score = 0.70 × PopularityScore + 0.30 × DiscoveryScore
 *
 * PopularityScore (products selling well):
 *   - Orders last 30 days   → 40%
 *   - Avg review rating     → 25%
 *   - Unique buyers         → 20%
 *   - Revenue generated     → 15%
 *
 * DiscoveryScore (new / unsold products):
 *   - Days since last order (inverted) → 40%
 *   - Price vs category average        → 30%
 *   - Profile completeness             → 20%
 *   - Artisan join recency             → 10%
 *
 * Results are cached for 30 minutes to avoid heavy DB queries.
 */

const NodeCache = require("node-cache");
const Product   = require("../models/Product");
const Order     = require("../models/Order");
const Review    = require("../models/Review");

const cache = new NodeCache({ stdTTL: 1800 }); // 30 min
const CACHE_KEY = "recommendations";

// ── Normalize helper: maps a value to 0–100 ──────────────────
function normalize(val, min, max) {
    if (max === min) return 50;
    return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
}

// ── Main scoring function ─────────────────────────────────────
async function computeRecommendations(limit = 20) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 1. Order stats per product (last 30 days)
    const orderStats = await Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.product",
                totalOrders:  { $sum: "$items.quantity" },
                uniqueBuyers: { $addToSet: "$consumer" },
                revenue:      { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                lastOrdered:  { $max: "$createdAt" },
            },
        },
        {
            $project: {
                totalOrders: 1,
                revenue: 1,
                lastOrdered: 1,
                uniqueBuyerCount: { $size: "$uniqueBuyers" },
            },
        },
    ]);

    // 2. All-time last order date per product (for discovery score)
    const allTimeLastOrder = await Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.product", lastOrdered: { $max: "$createdAt" } } },
    ]);
    const lastOrderMap = {};
    allTimeLastOrder.forEach(x => { lastOrderMap[x._id.toString()] = x.lastOrdered; });

    // 3. Review stats per product
    const reviewStats = await Review.aggregate([
        { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const reviewMap = {};
    reviewStats.forEach(r => { reviewMap[r._id.toString()] = r; });

    // 4. All approved products
    const products = await Product.find({ status: "approved" }).populate("artisan", "name createdAt");

    if (products.length === 0) return [];

    // 5. Build stats map
    const statsMap = {};
    orderStats.forEach(s => { statsMap[s._id.toString()] = s; });

    // 6. Category average prices
    const catPrices = {};
    products.forEach(p => {
        if (!catPrices[p.category]) catPrices[p.category] = [];
        catPrices[p.category].push(p.price);
    });
    const catAvg = {};
    Object.keys(catPrices).forEach(cat => {
        const arr = catPrices[cat];
        catAvg[cat] = arr.reduce((s, v) => s + v, 0) / arr.length;
    });

    // 7. Get max values for normalization
    const maxOrders   = Math.max(...orderStats.map(s => s.totalOrders), 1);
    const maxBuyers   = Math.max(...orderStats.map(s => s.uniqueBuyerCount), 1);
    const maxRevenue  = Math.max(...orderStats.map(s => s.revenue), 1);
    const now         = Date.now();

    // 8. Score each product
    const scored = products.map(p => {
        const id    = p._id.toString();
        const stats = statsMap[id] || {};
        const rev   = reviewMap[id] || {};

        // ── POPULARITY (70%) ──────────────────────────────────
        const orderScore  = normalize(stats.totalOrders || 0, 0, maxOrders);
        const ratingScore = (rev.avgRating || 0) * 20;   // 5★ → 100
        const buyerScore  = normalize(stats.uniqueBuyerCount || 0, 0, maxBuyers);
        const revenueScore= normalize(stats.revenue || 0, 0, maxRevenue);

        const popularityScore =
            orderScore   * 0.40 +
            ratingScore  * 0.25 +
            buyerScore   * 0.20 +
            revenueScore * 0.15;

        // ── DISCOVERY (30%) ───────────────────────────────────
        // Days since last order — more days = higher discovery score
        const lastO      = lastOrderMap[id];
        const daysSince  = lastO ? (now - new Date(lastO).getTime()) / 86400000 : 9999;
        const staleness  = Math.min(daysSince / 30, 1) * 100; // caps at 30 days

        // Price competitiveness (cheaper than category avg → better discovery)
        const avg        = catAvg[p.category] || p.price;
        const priceDiff  = avg > 0 ? Math.max(0, ((avg - p.price) / avg) * 100) : 50;
        const priceScore = Math.min(priceDiff, 100);

        // Profile completeness
        const completeness =
            (p.image       ? 40 : 0) +
            (p.description ? 35 : 0) +
            (p.category    ? 25 : 0);

        // Artisan recency (joined within 90 days → 100, older → 0)
        const artisanAge = p.artisan?.createdAt
            ? (now - new Date(p.artisan.createdAt).getTime()) / 86400000
            : 999;
        const artisanNew = Math.max(0, 100 - (artisanAge / 90) * 100);

        const discoveryScore =
            staleness    * 0.40 +
            priceScore   * 0.30 +
            completeness * 0.20 +
            artisanNew   * 0.10;

        // ── FINAL SCORE ───────────────────────────────────────
        const finalScore = 0.70 * popularityScore + 0.30 * discoveryScore;

        return {
            product: p,
            finalScore,
            popularityScore,
            discoveryScore,
            isNew:       !lastO,          // never ordered
            isTrending:  (stats.totalOrders || 0) >= 3,
            avgRating:   rev.avgRating || 0,
            reviewCount: rev.count || 0,
        };
    });

    return scored
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, limit);
}

// ── Public API with caching ───────────────────────────────────
exports.getRecommendations = async (limit = 20) => {
    const cached = cache.get(CACHE_KEY);
    if (cached) return cached;

    const results = await computeRecommendations(limit);
    cache.set(CACHE_KEY, results);
    return results;
};

// Call this when a new order is placed to invalidate cache
exports.invalidateCache = () => cache.del(CACHE_KEY);
