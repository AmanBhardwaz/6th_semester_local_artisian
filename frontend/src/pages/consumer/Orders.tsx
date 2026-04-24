import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";

const STEPS = ["placed", "processing", "shipped", "delivered"] as const;

const statusColors: Record<string, { bg: string; text: string }> = {
    placed:     { bg: "rgba(243,156,18,0.12)",  text: "#f39c12" },
    processing: { bg: "rgba(52,152,219,0.12)",  text: "#3498db" },
    shipped:    { bg: "rgba(155,89,182,0.12)",  text: "#9b59b6" },
    delivered:  { bg: "rgba(46,204,113,0.12)",  text: "#2ecc71" },
};

export default function ConsumerOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/orders/my`,
            { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setOrders(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <DashboardLayout title="My Orders">
            <p style={{ color: "#9ca3af" }}>Loading orders...</p>
        </DashboardLayout>
    );

    if (orders.length === 0) return (
        <DashboardLayout title="My Orders">
            <div className="orders-empty">
                <div className="orders-empty-icon">📦</div>
                <h3>No orders yet</h3>
                <button className="btn-primary" onClick={() => navigate("/consumer/shop")}
                    style={{ fontSize: "0.9rem", padding: "12px 28px" }}>
                    Shop Now
                </button>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout title="My Orders">
            {orders.map((order: any) => {
                const statusIdx = STEPS.indexOf(order.status);
                const colors = statusColors[order.status] || statusColors.placed;

                return (
                    <div key={order._id} className="order-card">

                        {/* ── Order Header ── */}
                        <div className="order-header">
                            <div className="order-meta">
                                <p className="order-id">#{order._id}</p>
                                <p>
                                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric", month: "long", year: "numeric"
                                    })}
                                </p>
                            </div>
                            <div className="order-header-right">
                                <span
                                    className="order-status-badge"
                                    style={{ backgroundColor: colors.bg, color: colors.text }}
                                >
                                    {order.status}
                                </span>
                                <span className="order-total">₹{order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* ── Order Items ── */}
                        <div className="order-items">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="order-item">
                                    <img className="order-item-img" src={item.image} alt={item.title}
                                        onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/58?text=?"; }} />
                                    <div className="order-item-info">
                                        <p className="order-item-title">{item.title}</p>
                                        <p className="order-item-qty">Qty: {item.quantity} × ₹{item.price}</p>
                                    </div>
                                    <span className="order-item-subtotal">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* ── Progress Tracker ── */}
                        <div className="order-tracker">
                            {STEPS.map((step, idx) => {
                                const done = idx <= statusIdx;
                                return (
                                    <div key={step} className="order-tracker-step">
                                        <div className={`tracker-dot ${done ? "done" : "pending"}`}>
                                            {done ? "✓" : idx + 1}
                                        </div>
                                        <span className={`tracker-label ${done ? "done" : "pending"}`}>
                                            {step.charAt(0).toUpperCase() + step.slice(1)}
                                        </span>
                                        {idx < STEPS.length - 1 && (
                                            <div className={`tracker-line ${done && idx < statusIdx ? "done" : "pending"}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </DashboardLayout>
    );
}
