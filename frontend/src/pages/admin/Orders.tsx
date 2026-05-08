import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin`;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const STATUS_COLORS: Record<string, string> = {
    placed:     "#b45309",
    processing: "#1d4ed8",
    shipped:    "#7c3aed",
    delivered:  "#065f46",
};

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    const fetchOrders = (status: string) => {
        setLoading(true);
        const q = status ? `?status=${status}` : "";
        axios.get(`${API}/orders${q}`, { headers: authHeader() })
            .then(r => setOrders(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchOrders(filter); }, [filter]);

    const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

    const TABS = [
        { label: "All",        value: "" },
        { label: "Placed",     value: "placed" },
        { label: "Processing", value: "processing" },
        { label: "Shipped",    value: "shipped" },
        { label: "Delivered",  value: "delivered" },
    ];

    return (
        <DashboardLayout title="All Orders">

            {/* Quick stat */}
            {!loading && (
                <div className="admin-stats-grid" style={{ marginBottom: 20 }}>
                    <div className="admin-stat-card green">
                        <p className="admin-stat-label">Showing Revenue</p>
                        <p className="admin-stat-value">₹{totalRevenue.toLocaleString("en-IN")}</p>
                        <p className="admin-stat-sub">{orders.length} orders</p>
                    </div>
                </div>
            )}

            <div className="admin-section">
                <div className="admin-section-header">
                    <h3 className="admin-section-title">📦 Orders</h3>
                    <div className="admin-tabs">
                        {TABS.map(t => (
                            <button key={t.value} className={`admin-tab${filter === t.value ? " active" : ""}`}
                                onClick={() => setFilter(t.value)}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="admin-table-wrap">
                    {loading ? (
                        <p style={{ padding: "24px", color: "#9ca3af" }}>Loading...</p>
                    ) : orders.length === 0 ? (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">📦</div>
                            <p>No orders found.</p>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o._id}>
                                        <td style={{ fontFamily: "monospace", fontSize: "0.74rem", color: "#6b7280" }}>
                                            #{o._id.slice(-8)}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, fontSize: "0.86rem" }}>{o.consumer?.name || "—"}</div>
                                            <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{o.consumer?.email}</div>
                                        </td>
                                        <td style={{ color: "#6b7280" }}>{o.items?.length} item{o.items?.length !== 1 ? "s" : ""}</td>
                                        <td style={{ fontWeight: 800, color: "#7c3aed" }}>₹{o.totalAmount?.toLocaleString("en-IN")}</td>
                                        <td>
                                            <span className={`badge badge-${o.status}`} style={{ color: STATUS_COLORS[o.status] }}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${o.paymentStatus === "paid" ? "badge-approved" : "badge-pending"}`}>
                                                {o.paymentStatus || "pending"}
                                            </span>
                                        </td>
                                        <td style={{ color: "#9ca3af", fontSize: "0.78rem" }}>
                                            {new Date(o.createdAt).toLocaleDateString("en-IN")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
