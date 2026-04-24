const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendOrderConfirmation } = require("../utils/emailService");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// STEP 1 — Create a Razorpay order (frontend calls this first)
exports.createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body; // amount in rupees from frontend

        if (!amount || amount <= 0)
            return res.status(400).json({ message: "Invalid amount" });

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects paise (₹1 = 100 paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.json({
            orderId: razorpayOrder.id,          // order_xxx — sent to Razorpay modal
            amount: razorpayOrder.amount,        // in paise
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,  // safe to expose to frontend
        });
    } catch (err) {
        console.error("Razorpay order creation failed:", err);
        res.status(500).json({ message: "Could not create payment order" });
    }
};

// STEP 2 — Verify Razorpay payment signature & save order to DB
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            items,
            totalAmount,
        } = req.body;

        // --- Verify HMAC-SHA256 signature ---
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed — invalid signature" });
        }

        // --- Signature valid → create order in DB ---
        if (!items || items.length === 0)
            return res.status(400).json({ message: "Cart is empty" });

        // Populate artisan IDs from products
        const populatedItems = await Promise.all(
            items.map(async (item) => {
                const product = await Product.findById(item.product);
                return { ...item, artisan: product?.artisan || null };
            })
        );

        const order = await Order.create({
            consumer: req.user.id,
            items: populatedItems,
            totalAmount,
            paymentMethod: "Razorpay",
            paymentStatus: "paid",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
        });

        // Send confirmation email (non-blocking)
        try {
            const consumer = await User.findById(req.user.id).select("name email");
            if (consumer?.email) {
                await sendOrderConfirmation(consumer.email, consumer.name, order);
            }
        } catch (mailErr) {
            console.error("Email send failed:", mailErr.message);
        }

        res.status(201).json({ message: "Payment verified & order placed!", order });
    } catch (err) {
        console.error("Payment verification error:", err);
        res.status(500).json({ message: err.message });
    }
};

// Consumer places an order — kept for backward compatibility
exports.placeOrder = async (req, res) => {
    try {
        const { items, totalAmount, paymentMethod } = req.body;

        if (!items || items.length === 0)
            return res.status(400).json({ message: "Cart is empty" });

        const populatedItems = await Promise.all(
            items.map(async (item) => {
                const product = await Product.findById(item.product);
                return { ...item, artisan: product?.artisan || null };
            })
        );

        const order = await Order.create({
            consumer: req.user.id,
            items: populatedItems,
            totalAmount,
            paymentMethod: paymentMethod || "UPI",
        });

        try {
            const consumer = await User.findById(req.user.id).select("name email");
            if (consumer?.email) {
                await sendOrderConfirmation(consumer.email, consumer.name, order);
            }
        } catch (mailErr) {
            console.error("Email send failed:", mailErr.message);
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

