import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";

const statusColors: Record<string, string> = {
    placed: "#f39c12",
    processing: "#3498db",
    shipped: "#9b59b6",
    delivered: "#2ecc71",
};

export default function ConsumerOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/orders/my`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setOrders(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <DashboardLayout title="My Orders"><p style={{ color: "#888" }}>Loading orders...</p></DashboardLayout>;

    if (orders.length === 0) {
        return (
            <DashboardLayout title="My Orders">
                <div style={{ textAlign: "center", padding: "80px", color: "#aaa" }}>
                    <div style={{ fontSize: "4rem" }}>📦</div>
                    <h3>No orders yet</h3>
                    <button onClick={() => navigate("/consumer/shop")}
                        style={{ padding: "12px 30px", backgroundColor: "#667eea", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                        Shop Now
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="My Orders">
            {orders.map((order: any) => (
                <div key={order._id} style={{ backgroundColor: "white", borderRadius: "12px", padding: "25px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    {/* Order Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                            <p style={{ margin: "0 0 4px 0", color: "#888", fontSize: "0.85rem" }}>Order ID: {order._id}</p>
                            <p style={{ margin: 0, color: "#888", fontSize: "0.85rem" }}>
                                {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <span style={{ padding: "5px 15px", borderRadius: "20px", backgroundColor: statusColors[order.status] + "22", color: statusColors[order.status], fontWeight: "bold", fontSize: "0.85rem", textTransform: "capitalize" }}>
                                {order.status}
                            </span>
                            <span style={{ fontWeight: "bold", color: "#667eea", fontSize: "1.1rem" }}>₹ {order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {order.items.map((item: any, idx: number) => (
                            <div key={idx} style={{ display: "flex", gap: "15px", alignItems: "center", padding: "12px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
                                <img src={item.image} alt={item.title}
                                    style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px" }}
                                    onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/60?text=?"; }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: "0 0 4px 0", fontWeight: "bold", color: "#2c3e50" }}>{item.title}</p>
                                    <p style={{ margin: 0, color: "#888", fontSize: "0.85rem" }}>Qty: {item.quantity} × ₹{item.price}</p>
                                </div>
                                <p style={{ margin: 0, fontWeight: "bold", color: "#2c3e50" }}>₹ {(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Progress Tracker */}
                    <div style={{ marginTop: "20px", display: "flex", alignItems: "center" }}>
                        {["placed", "processing", "shipped", "delivered"].map((step, idx, arr) => {
                            const stepIdx = ["placed", "processing", "shipped", "delivered"].indexOf(order.status);
                            const currentIdx = idx;
                            const done = currentIdx <= stepIdx;
                            return (
                                <div key={step} style={{ display: "flex", alignItems: "center", flex: idx < arr.length - 1 ? 1 : 0 }}>
                                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: done ? "#667eea" : "#eee", display: "flex", alignItems: "center", justifyContent: "center", color: done ? "white" : "#aaa", fontSize: "0.75rem", fontWeight: "bold", flexShrink: 0 }}>
                                        {done ? "✓" : idx + 1}
                                    </div>
                                    <p style={{ margin: "0 0 0 6px", fontSize: "0.75rem", color: done ? "#667eea" : "#aaa", whiteSpace: "nowrap", flexShrink: 0 }}>{step.charAt(0).toUpperCase() + step.slice(1)}</p>
                                    {idx < arr.length - 1 && <div style={{ flex: 1, height: "2px", backgroundColor: done ? "#667eea" : "#eee", margin: "0 8px" }} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </DashboardLayout>
    );
}
