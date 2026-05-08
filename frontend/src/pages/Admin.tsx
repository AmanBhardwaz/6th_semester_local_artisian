import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from "recharts";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin`;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function Admin() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API}/stats`, { headers: authHeader() })
            .then(r => setStats(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <DashboardLayout title="Admin Overview">
            <p style={{ color: "#9ca3af" }}>Loading dashboard...</p>
        </DashboardLayout>
    );

    const cards = [
        { label: "Total Users",       value: stats.totalUsers,     sub: `${stats.totalArtisans} artisans · ${stats.totalConsumers} consumers`, color: "blue" },
        { label: "Total Revenue",     value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, sub: "All paid orders", color: "green" },
        { label: "Total Orders",      value: stats.totalOrders,    sub: "Across all users",   color: "purple" },
        { label: "Live Products",     value: stats.totalProducts,  sub: "Approved & visible",  color: "orange" },
        { label: "Pending Approval",  value: stats.pendingProducts,sub: "Awaiting review",     color: "red" },
    ];

    return (
        <DashboardLayout title="Admin Overview">

            {/* ── Stat Cards ── */}
            <div className="admin-stats-grid">
                {cards.map(c => (
                    <div key={c.label} className={`admin-stat-card ${c.color}`}>
                        <p className="admin-stat-label">{c.label}</p>
                        <p className="admin-stat-value">{c.value}</p>
                        <p className="admin-stat-sub">{c.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Revenue Chart ── */}
            <div className="admin-section">
                <div className="admin-section-header">
                    <h3 className="admin-section-title">📈 Revenue — Last 6 Months</h3>
                </div>
                <div className="admin-chart-wrap">
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={stats.revenueByMonth}>
                            <defs>
                                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.18} />
                                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                            <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }}
                                   tickFormatter={v => `₹${v.toLocaleString("en-IN")}`} />
                            <Tooltip formatter={(v) => [`₹${Number(v ?? 0).toLocaleString("en-IN")}`, "Revenue"]} />
                            <Area type="monotone" dataKey="revenue" stroke="#7c3aed"
                                  strokeWidth={2.5} fill="url(#rev)" dot={{ r: 4, fill: "#7c3aed" }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Recent Orders ── */}
            <div className="admin-section">
                <div className="admin-section-header">
                    <h3 className="admin-section-title">🕐 Recent Orders</h3>
                </div>
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders.map((o: any) => (
                                <tr key={o._id}>
                                    <td style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#6b7280" }}>
                                        #{o._id.slice(-8)}
                                    </td>
                                    <td>{o.consumer?.name || "—"}</td>
                                    <td style={{ fontWeight: 700, color: "#7c3aed" }}>
                                        ₹{o.totalAmount?.toLocaleString("en-IN")}
                                    </td>
                                    <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                                    <td style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
                                        {new Date(o.createdAt).toLocaleDateString("en-IN")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
