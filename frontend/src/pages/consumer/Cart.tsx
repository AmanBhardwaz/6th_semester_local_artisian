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

type PaymentMethod = "razorpay" | "cod";

export default function Cart() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [paying, setPaying] = useState(false);
    const [payMethod, setPayMethod] = useState<PaymentMethod>("razorpay");

    // ── COD Handler ──────────────────────────────────────────
    const handleCOD = async () => {
        if (cartItems.length === 0) return;
        if (!confirm("Confirm Cash on Delivery order?")) return;
        setPaying(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API}/place`, {
                items: cartItems.map(item => ({
                    product:  item._id,
                    title:    item.title,
                    image:    item.image,
                    price:    item.price,
                    quantity: item.quantity,
                })),
                totalAmount:   cartTotal,
                paymentMethod: "COD",
            }, { headers: { Authorization: `Bearer ${token}` } });

            clearCart();
            navigate("/consumer/orders");
        } catch (err: any) {
            alert(err?.response?.data?.message || "Could not place order. Try again.");
            setPaying(false);
        }
    };

    // ── Razorpay Handler ─────────────────────────────────────
    const handleRazorpay = async () => {
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
                        const token = localStorage.getItem("token");
                        await axios.post(`${API}/verify-payment`, {
                            razorpay_order_id:  response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature:  response.razorpay_signature,
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

    const handleCheckout = () => payMethod === "cod" ? handleCOD() : handleRazorpay();

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

                        {/* ── Payment Method Selector ── */}
                        <p style={{ margin: "0 0 10px", fontSize: "0.82rem", fontWeight: 700, color: "#6b7280" }}>
                            Select Payment Method
                        </p>

                        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                            {/* Razorpay option */}
                            <label style={{
                                flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                                gap: "4px", padding: "10px 8px", borderRadius: "10px", cursor: "pointer",
                                border: `2px solid ${payMethod === "razorpay" ? "#7c3aed" : "#e2e8f0"}`,
                                background: payMethod === "razorpay" ? "#f5f3ff" : "white",
                                transition: "all 0.15s",
                            }}>
                                <input type="radio" name="paymethod" value="razorpay"
                                    checked={payMethod === "razorpay"}
                                    onChange={() => setPayMethod("razorpay")}
                                    style={{ display: "none" }} />
                                <span style={{ fontSize: "1.3rem" }}>💳</span>
                                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: payMethod === "razorpay" ? "#7c3aed" : "#6b7280" }}>
                                    Online Pay
                                </span>
                            </label>

                            {/* COD option */}
                            <label style={{
                                flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                                gap: "4px", padding: "10px 8px", borderRadius: "10px", cursor: "pointer",
                                border: `2px solid ${payMethod === "cod" ? "#10b981" : "#e2e8f0"}`,
                                background: payMethod === "cod" ? "#f0fdf4" : "white",
                                transition: "all 0.15s",
                            }}>
                                <input type="radio" name="paymethod" value="cod"
                                    checked={payMethod === "cod"}
                                    onChange={() => setPayMethod("cod")}
                                    style={{ display: "none" }} />
                                <span style={{ fontSize: "1.3rem" }}>💵</span>
                                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: payMethod === "cod" ? "#065f46" : "#6b7280" }}>
                                    Cash on Delivery
                                </span>
                            </label>
                        </div>

                        {/* ── Checkout Button ── */}
                        <button className="cart-pay-btn" onClick={handleCheckout} disabled={paying}
                            style={payMethod === "cod" ? { background: "linear-gradient(135deg, #10b981, #065f46)" } : {}}>
                            {paying ? (
                                <><span className="cart-pay-spinner" /> {payMethod === "cod" ? "Placing Order..." : "Opening Razorpay..."}</>
                            ) : payMethod === "cod" ? (
                                <>💵 Place Order · ₹{cartTotal.toFixed(2)} COD</>
                            ) : (
                                <>💳 Pay ₹{cartTotal.toFixed(2)} with Razorpay</>
                            )}
                        </button>

                        <div className="cart-trust-badge">
                            {payMethod === "cod"
                                ? "🏠 Pay when your order arrives at doorstep"
                                : "🔒 Secured by Razorpay · UPI · Cards · Net Banking"}
                        </div>

                        <button className="cart-clear-btn" onClick={clearCart}>🗑️ Clear Cart</button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
