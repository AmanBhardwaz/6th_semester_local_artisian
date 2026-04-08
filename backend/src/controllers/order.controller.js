const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendOrderConfirmation } = require("../utils/emailService");

// Consumer places an order (cart -> order)
exports.placeOrder = async (req, res) => {
    try {
        const { items, totalAmount, paymentMethod } = req.body;

        if (!items || items.length === 0)
            return res.status(400).json({ message: "Cart is empty" });

        // For each item, look up the product to get the artisan ID
        const populatedItems = await Promise.all(
            items.map(async (item) => {
                const product = await Product.findById(item.product);
                return {
                    ...item,
                    artisan: product?.artisan || null,
                };
            })
        );

        const order = await Order.create({
            consumer: req.user.id,
            items: populatedItems,
            totalAmount,
            paymentMethod: paymentMethod || "UPI",
        });

        // Send confirmation email (non-blocking)
        try {
            const consumer = await User.findById(req.user.id).select("name email");
            if (consumer?.email) {
                await sendOrderConfirmation(consumer.email, consumer.name, order);
            }
        } catch (mailErr) {
            console.error("Email send failed:", mailErr.message);
            // Don't fail the order if email fails
        }

        res.status(201).json({ message: "Order placed successfully!", order });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Consumer: get their own orders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ consumer: req.user.id })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Artisan: get orders that contain their products
exports.getArtisanOrders = async (req, res) => {
    try {
        const orders = await Order.find({ "items.artisan": req.user.id })
            .populate("consumer", "name email")
            .sort({ createdAt: -1 });

        // Filter each order's items to only this artisan's products
        const filtered = orders.map(order => ({
            _id: order._id,
            consumer: order.consumer,
            status: order.status,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            items: order.items.filter(
                item => item.artisan?.toString() === req.user.id
            ),
            totalAmount: order.items
                .filter(item => item.artisan?.toString() === req.user.id)
                .reduce((sum, item) => sum + item.price * item.quantity, 0),
        }));

        res.json(filtered);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Artisan: update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.status = status;
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
