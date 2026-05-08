const User    = require("../models/User");
const Product = require("../models/Product");
const Order   = require("../models/Order");

// ── GET /api/admin/stats ──────────────────────────────────────
exports.getStats = async (req, res) => {
    try {
        const [totalUsers, totalArtisans, totalConsumers,
               totalProducts, pendingProducts,
               allOrders] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "artisan" }),
            User.countDocuments({ role: "consumer" }),
            Product.countDocuments({ status: "approved" }),
            Product.countDocuments({ status: "pending" }),
            Order.find().select("totalAmount createdAt status"),
        ]);

        const totalRevenue = allOrders
            .filter(o => o.status !== "cancelled")
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Revenue per month (last 6 months)
        const now = new Date();
        const revenueByMonth = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
            const revenue = allOrders
                .filter(o => {
                    const created = new Date(o.createdAt);
                    return created.getMonth() === d.getMonth() &&
                           created.getFullYear() === d.getFullYear();
                })
                .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            revenueByMonth.push({ month: label, revenue: Math.round(revenue) });
        }

        // Recent 5 orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("consumer", "name email");

        res.json({
            totalUsers, totalArtisans, totalConsumers,
            totalProducts, pendingProducts,
            totalOrders: allOrders.length,
            totalRevenue: Math.round(totalRevenue),
            revenueByMonth,
            recentOrders,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── GET /api/admin/products?status=pending ────────────────────
exports.getProducts = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const products = await Product.find(filter)
            .populate("artisan", "name email")
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── PUT /api/admin/products/:id/approve ──────────────────────
exports.approveProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { status: "approved", adminNote: "" },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product approved", product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── PUT /api/admin/products/:id/reject ───────────────────────
exports.rejectProduct = async (req, res) => {
    try {
        const { reason } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { status: "rejected", adminNote: reason || "Does not meet guidelines." },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product rejected", product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── GET /api/admin/users ─────────────────────────────────────
exports.getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const filter = role ? { role } : {};
        const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── PUT /api/admin/users/:id/ban ─────────────────────────────
exports.banUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role === "admin")
            return res.status(403).json({ message: "Cannot ban an admin" });

        user.isBanned = true;
        await user.save();
        res.json({ message: `${user.name} has been banned` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── PUT /api/admin/users/:id/unban ───────────────────────────
exports.unbanUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isBanned: false },
            { new: true }
        ).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: `${user.name} has been unbanned`, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── GET /api/admin/orders ─────────────────────────────────────
exports.getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const orders = await Order.find(filter)
            .populate("consumer", "name email")
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
