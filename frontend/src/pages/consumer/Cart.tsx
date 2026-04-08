import { useState } from "react";
import { useCart } from "../../context/CartContext";
import type { CartItem } from "../../context/CartContext";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/orders`;

export default function Cart() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [showPayModal, setShowPayModal] = useState(false);
    const [payMethod, setPayMethod] = useState("UPI");
    const [upiId, setUpiId] = useState("");
    const [paying, setPaying] = useState(false);
    const [payStep, setPayStep] = useState<"form" | "processing" | "success">("form");

    const handleCheckout = async () => {
        if (payMethod === "UPI" && !upiId.trim()) {
            alert("Please enter your UPI ID"); return;
        }
        setPaying(true);
        setPayStep("processing");

        // Simulate 2s payment processing delay
        await new Promise(res => setTimeout(res, 2000));

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API}/place`, {
                items: cartItems.map(item => ({
                    product: item._id,
                    title: item.title,
                    image: item.image,
                    price: item.price,
                    quantity: item.quantity,
                    artisan: null, // artisan id stored in product, backend can populate
                })),
                totalAmount: cartTotal,
                paymentMethod: payMethod,
            }, { headers: { Authorization: `Bearer ${token}` } });

            setPayStep("success");
            setTimeout(() => {
                clearCart();
                setShowPayModal(false);
                navigate("/consumer/orders");
            }, 2000);
        } catch (err) {
            alert("Order failed. Try again.");
            setPayStep("form");
        } finally {
            setPaying(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <DashboardLayout title="My Cart">
                <div style={{ textAlign: "center", padding: "80px 20px", color: "#aaa" }}>
                    <div style={{ fontSize: "5rem" }}>🛒</div>
                    <h2 style={{ color: "#666" }}>Your cart is empty</h2>
                    <p>Go to the marketplace and add some amazing products!</p>
                    <button onClick={() => navigate("/consumer/shop")}
                        style={{ marginTop: "20px", padding: "12px 30px", backgroundColor: "#667eea", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" }}>
                        Browse Marketplace
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="My Cart">
            <div style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}>

                {/* Cart Items */}
                <div style={{ flex: 1 }}>
                    {cartItems.map((item: CartItem) => (
                        <div key={item._id} style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", marginBottom: "15px", display: "flex", gap: "20px", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                            <img src={item.image} alt={item.title}
                                style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }}
                                onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/90?text=?"; }} />
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: "0 0 4px 0", color: "#2c3e50" }}>{item.title}</h4>
                                <p style={{ margin: "0 0 10px 0", color: "#95a5a6", fontSize: "0.85rem" }}>By {item.artisanName}</p>
                                <span style={{ fontWeight: "bold", color: "#667eea", fontSize: "1.1rem" }}>₹ {item.price}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                    style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #ddd", background: "white", cursor: "pointer", fontSize: "1.1rem" }}>−</button>
                                <span style={{ fontWeight: "bold", minWidth: "20px", textAlign: "center" }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                    style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #ddd", background: "white", cursor: "pointer", fontSize: "1.1rem" }}>+</button>
                            </div>
                            <div style={{ minWidth: "80px", textAlign: "right" }}>
                                <p style={{ margin: 0, fontWeight: "bold", color: "#2c3e50" }}>₹ {(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                            <button onClick={() => removeFromCart(item._id)}
                                style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "#e74c3c" }}>🗑️</button>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div style={{ width: "320px", flexShrink: 0 }}>
                    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "25px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                        <h3 style={{ margin: "0 0 20px 0", color: "#2c3e50" }}>Order Summary</h3>
                        {cartItems.map((item: CartItem) => (
                            <div key={item._id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "#555", fontSize: "0.9rem" }}>
                                <span>{item.title} × {item.quantity}</span>
                                <span>₹ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div style={{ borderTop: "1px solid #eee", margin: "15px 0", paddingTop: "15px", display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Total</span>
                            <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#667eea" }}>₹ {cartTotal.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={() => { setPayStep("form"); setShowPayModal(true); }}
                            style={{ width: "100%", padding: "15px", backgroundColor: "#667eea", color: "white", border: "none", borderRadius: "10px", fontSize: "1rem", cursor: "pointer", fontWeight: "bold", marginBottom: "10px" }}>
                            Proceed to Checkout →
                        </button>
                        <button onClick={clearCart}
                            style={{ width: "100%", padding: "10px", backgroundColor: "#fdecea", color: "#c0392b", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600" }}>
                            Clear Cart
                        </button>
                    </div>
                </div>
            </div>

            {/* ====== Simulated Payment Modal ====== */}
            {showPayModal && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "40px", width: "420px", maxWidth: "95vw", textAlign: "center" }}>

                        {payStep === "form" && (
                            <>
                                {/* Header */}
                                <div style={{ display: "flex", alignItems: "center", marginBottom: "25px" }}>
                                    <div style={{ width: "40px", height: "40px", backgroundColor: "#667eea", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "12px", fontSize: "1.3rem" }}>💳</div>
                                    <div style={{ textAlign: "left" }}>
                                        <h3 style={{ margin: 0, color: "#2c3e50" }}>Complete Payment</h3>
                                        <p style={{ margin: 0, color: "#667eea", fontWeight: "bold" }}>₹ {cartTotal.toFixed(2)}</p>
                                    </div>
                                    <button onClick={() => setShowPayModal(false)} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#aaa" }}>✕</button>
                                </div>

                                {/* Payment Method Tabs */}
                                <div style={{ display: "flex", gap: "10px", marginBottom: "25px" }}>
                                    {["UPI", "Card", "Net Banking"].map(m => (
                                        <button key={m} onClick={() => setPayMethod(m)}
                                            style={{ flex: 1, padding: "10px", border: `2px solid ${payMethod === m ? "#667eea" : "#ddd"}`, borderRadius: "8px", background: payMethod === m ? "#f0f0ff" : "white", color: payMethod === m ? "#667eea" : "#555", cursor: "pointer", fontWeight: payMethod === m ? "bold" : "normal" }}>
                                            {m === "UPI" ? "📱 UPI" : m === "Card" ? "💳 Card" : "🏦 Net Banking"}
                                        </button>
                                    ))}
                                </div>

                                {payMethod === "UPI" && (
                                    <div style={{ marginBottom: "20px", textAlign: "left" }}>
                                        <label style={{ fontSize: "0.9rem", color: "#555", display: "block", marginBottom: "8px" }}>UPI ID</label>
                                        <input placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)}
                                            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "1rem", boxSizing: "border-box" }} />
                                        <p style={{ fontSize: "0.8rem", color: "#aaa", margin: "6px 0 0 0" }}>Example: name@okaxis, name@paytm</p>
                                    </div>
                                )}

                                {payMethod === "Card" && (
                                    <div style={{ marginBottom: "20px", textAlign: "left" }}>
                                        <input placeholder="Card Number" defaultValue="4111 1111 1111 1111"
                                            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "10px", boxSizing: "border-box" }} />
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <input placeholder="MM/YY" defaultValue="12/26" style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }} />
                                            <input placeholder="CVV" defaultValue="123" style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }} />
                                        </div>
                                    </div>
                                )}

                                {payMethod === "Net Banking" && (
                                    <div style={{ marginBottom: "20px", textAlign: "left" }}>
                                        <select style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box", fontSize: "1rem" }}>
                                            <option>SBI</option><option>HDFC Bank</option><option>ICICI Bank</option><option>Axis Bank</option><option>Punjab National Bank</option>
                                        </select>
                                    </div>
                                )}

                                <button onClick={handleCheckout} disabled={paying}
                                    style={{ width: "100%", padding: "15px", backgroundColor: "#667eea", color: "white", border: "none", borderRadius: "10px", fontSize: "1rem", cursor: "pointer", fontWeight: "bold" }}>
                                    Pay ₹ {cartTotal.toFixed(2)}
                                </button>
                                <p style={{ fontSize: "0.75rem", color: "#aaa", marginTop: "12px" }}>🔒 Simulated payment — no real money deducted</p>
                            </>
                        )}

                        {payStep === "processing" && (
                            <div style={{ padding: "20px" }}>
                                <div style={{ fontSize: "3rem", marginBottom: "20px", animation: "spin 1s linear infinite" }}>⏳</div>
                                <h3 style={{ color: "#2c3e50" }}>Processing Payment...</h3>
                                <p style={{ color: "#888" }}>Please wait while we verify your payment</p>
                                <div style={{ height: "4px", backgroundColor: "#eee", borderRadius: "2px", marginTop: "20px", overflow: "hidden" }}>
                                    <div style={{ height: "100%", backgroundColor: "#667eea", width: "60%", borderRadius: "2px", animation: "progress 2s linear" }} />
                                </div>
                            </div>
                        )}

                        {payStep === "success" && (
                            <div style={{ padding: "20px" }}>
                                <div style={{ fontSize: "4rem", marginBottom: "15px" }}>✅</div>
                                <h2 style={{ color: "#2ecc71" }}>Payment Successful!</h2>
                                <p style={{ color: "#555" }}>Your order has been placed.</p>
                                <p style={{ color: "#888", fontSize: "0.9rem" }}>Redirecting to My Orders...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
