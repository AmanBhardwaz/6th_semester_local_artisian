import { useState } from "react";
import { useCart } from "../../context/CartContext";
import type { CartItem } from "../../context/CartContext";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/orders`;

function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if (document.getElementById("razorpay-script")) { resolve(true); return; }
        const script = document.createElement("script");
        script.id = "razorpay-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export default function Cart() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [paying, setPaying] = useState(false);

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        setPaying(true);
        try {
            const loaded = await loadRazorpayScript();
            if (!loaded) { alert("Failed to load Razorpay. Check your internet connection."); setPaying(false); return; }

            const token = localStorage.getItem("token");
            const { data } = await axios.post(`${API}/create-razorpay-order`, { amount: cartTotal },
                { headers: { Authorization: `Bearer ${token}` } });

            const options = {
                key: data.key, amount: data.amount, currency: data.currency,
                name: "Local Artisan",
                description: `${cartItems.length} item${cartItems.length > 1 ? "s" : ""} from marketplace`,
                order_id: data.orderId,
                handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; }) => {
                    try {
                        await axios.post(`${API}/verify-payment`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            items: cartItems.map(item => ({ product: item._id, title: item.title, image: item.image, price: item.price, quantity: item.quantity })),
                            totalAmount: cartTotal,
                        }, { headers: { Authorization: `Bearer ${token}` } });
                        clearCart();
                        navigate("/consumer/orders");
                    } catch {
                        alert("Payment received but order confirmation failed. Payment ID: " + response.razorpay_payment_id);
                    }
                },
                prefill: { name: "", email: "" },
                theme: { color: "#7c3aed" },
                modal: { ondismiss: () => setPaying(false) },
            };

            // @ts-ignore
            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", (r: { error: { description: string } }) => { alert("Payment failed: " + r.error.description); setPaying(false); });
            rzp.open();
        } catch (err: any) {
            alert(err?.response?.data?.message || "Could not initiate payment. Try again.");
            setPaying(false);
        }
    };

    // ── Empty cart ──
    if (cartItems.length === 0) {
        return (
            <DashboardLayout title="My Cart">
                <div className="cart-empty">
                    <div className="cart-empty-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Go to the marketplace and add some amazing products!</p>
                    <button className="btn-primary" onClick={() => navigate("/consumer/shop")}
                        style={{ fontSize: "0.95rem", padding: "12px 28px" }}>
                        Browse Marketplace
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="My Cart">
            <div className="cart-layout">

                {/* ── Cart Items ── */}
                <div className="cart-items">
                    {cartItems.map((item: CartItem) => (
                        <div key={item._id} className="cart-item">
                            <img className="cart-item-img" src={item.image} alt={item.title}
                                onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/86?text=?"; }} />

                            <div className="cart-item-info">
                                <h4 className="cart-item-title">{item.title}</h4>
                                <p className="cart-item-artisan">By {item.artisanName}</p>
                                <span className="cart-item-price">₹{item.price}</span>
                            </div>

                            <div className="cart-qty-ctrl">
                                <button className="cart-qty-btn" onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                                <span className="cart-qty-num">{item.quantity}</span>
                                <button className="cart-qty-btn" onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                            </div>

                            <div className="cart-item-subtotal">₹{(item.price * item.quantity).toFixed(2)}</div>

                            <button className="cart-del-btn" onClick={() => removeFromCart(item._id)} title="Remove">🗑️</button>
                        </div>
                    ))}
                </div>

                {/* ── Order Summary Panel ── */}
                <div className="cart-summary-panel">
                    <div className="cart-summary-card">
                        <h3 className="cart-summary-title">Order Summary</h3>

                        {cartItems.map((item: CartItem) => (
                            <div key={item._id} className="cart-summary-row">
                                <span>{item.title} × {item.quantity}</span>
                                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}

                        <hr className="cart-summary-divider" />

                        <div className="cart-total-row">
                            <span className="cart-total-label">Total</span>
                            <span className="cart-total-amount">₹{cartTotal.toFixed(2)}</span>
                        </div>

                        <button className="cart-pay-btn" onClick={handleCheckout} disabled={paying}>
                            {paying ? (
                                <><span className="cart-pay-spinner" /> Opening Razorpay...</>
                            ) : (
                                <>💳 Pay ₹{cartTotal.toFixed(2)} with Razorpay</>
                            )}
                        </button>

                        <div className="cart-trust-badge">
                            🔒 Secured by <strong>Razorpay</strong> · UPI · Cards · Net Banking · Wallets
                        </div>

                        <button className="cart-clear-btn" onClick={clearCart}>🗑️ Clear Cart</button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
