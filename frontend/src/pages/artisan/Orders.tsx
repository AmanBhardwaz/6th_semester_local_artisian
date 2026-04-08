import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";

const statusColors: Record<string, string> = {
    placed: "#f39c12",
    processing: "#3498db",
    shipped: "#9b59b6",
    delivered: "#2ecc71",
};

const nextStatus: Record<string, string> = {
    placed: "processing",
    processing: "shipped",
    shipped: "delivered",
    delivered: "delivered",
};

export default function ArtisanOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = () => {
        const token = localStorage.getItem("token");
        axios.get("http://localhost:5000/api/orders/artisan", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setOrders(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdating(orderId);
        const token = localStorage.getItem("token");
        try {
            await axios.put(`http://localhost:5000/api/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            alert("Failed to update status.");
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return <DashboardLayout title="Orders Received"><p style={{ color: "#888" }}>Loading orders...</p></DashboardLayout>;

    if (orders.length === 0) {
        return (
            <DashboardLayout title="Orders Received">
                <div style={{ textAlign: "center", padding: "80px", color: "#aaa" }}>
                    <div style={{ fontSize: "4rem" }}>🛍️</div>
                    <h3>No orders received yet</h3>
                    <p>When consumers buy your products, they'll appear here.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Orders Received">
            <p style={{ color: "#888", marginBottom: "20px" }}>{orders.length} order{orders.length !== 1 ? "s" : ""} received</p>
            {orders.map((order: any) => (
                <div key={order._id} style={{ backgroundColor: "white", borderRadius: "12px", padding: "25px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    {/* Order Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                            <p style={{ margin: "0 0 4px 0", fontWeight: "bold", color: "#2c3e50" }}>
                                👤 {order.consumer?.name || "Consumer"} ({order.consumer?.email || ""})
                            </p>
                            <p style={{ margin: 0, color: "#888", fontSize: "0.85rem" }}>
                                {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <span style={{ padding: "5px 15px", borderRadius: "20px", backgroundColor: statusColors[order.status] + "22", color: statusColors[order.status], fontWeight: "bold", fontSize: "0.85rem", textTransform: "capitalize" }}>
                                {order.status}
                            </span>
                            <span style={{ fontWeight: "bold", color: "#27ae60" }}>₹ {order.totalAmount?.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Items */}
                    {order.items.map((item: any, idx: number) => (
                        <div key={idx} style={{ display: "flex", gap: "15px", alignItems: "center", padding: "12px", backgroundColor: "#f9f9f9", borderRadius: "8px", marginBottom: "8px" }}>
                            <img src={item.image} alt={item.title}
                                style={{ width: "55px", height: "55px", objectFit: "cover", borderRadius: "6px" }}
                                onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/55?text=?"; }} />
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: "bold", color: "#2c3e50" }}>{item.title}</p>
                                <p style={{ margin: "3px 0 0 0", color: "#888", fontSize: "0.85rem" }}>Qty: {item.quantity}</p>
                            </div>
                            <p style={{ margin: 0, fontWeight: "bold" }}>₹ {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}

                    {/* Update Status Button */}
                    {order.status !== "delivered" && (
                        <button
                            onClick={() => handleStatusUpdate(order._id, nextStatus[order.status])}
                            disabled={updating === order._id}
                            style={{ marginTop: "15px", padding: "10px 20px", backgroundColor: "#2c3e50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                            {updating === order._id ? "Updating..." : `Mark as ${nextStatus[order.status].charAt(0).toUpperCase() + nextStatus[order.status].slice(1)} →`}
                        </button>
                    )}
                    {order.status === "delivered" && (
                        <p style={{ marginTop: "10px", color: "#2ecc71", fontWeight: "bold" }}>✅ Delivered</p>
                    )}
                </div>
            ))}
        </DashboardLayout>
    );
}
