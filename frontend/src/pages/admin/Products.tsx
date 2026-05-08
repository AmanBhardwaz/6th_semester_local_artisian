import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin`;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("pending");

    const fetchProducts = (status: string) => {
        setLoading(true);
        axios.get(`${API}/products?status=${status}`, { headers: authHeader() })
            .then(r => setProducts(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchProducts(filter); }, [filter]);

    const approve = async (id: string) => {
        await axios.put(`${API}/products/${id}/approve`, {}, { headers: authHeader() });
        setProducts(p => p.filter(x => x._id !== id));
    };

    const reject = async (id: string) => {
        const reason = prompt("Rejection reason (optional):");
        await axios.put(`${API}/products/${id}/reject`, { reason }, { headers: authHeader() });
        setProducts(p => p.filter(x => x._id !== id));
    };

    const TABS = ["pending", "approved", "rejected"] as const;

    return (
        <DashboardLayout title="Product Moderation">
            <div className="admin-section">
                <div className="admin-section-header">
                    <h3 className="admin-section-title">🛍️ Products</h3>
                    <div className="admin-tabs">
                        {TABS.map(t => (
                            <button key={t} className={`admin-tab${filter === t ? " active" : ""}`}
                                onClick={() => setFilter(t)}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <p style={{ padding: "24px", color: "#9ca3af" }}>Loading...</p>
                ) : products.length === 0 ? (
                    <div className="admin-empty">
                        <div className="admin-empty-icon">✅</div>
                        <p>No {filter} products.</p>
                    </div>
                ) : (
                    <div className="approval-grid">
                        {products.map(p => (
                            <div key={p._id} className="approval-card">
                                <img className="approval-card-img" src={p.image} alt={p.title}
                                    onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/240x155?text=No+Image"; }} />
                                <div className="approval-card-body">
                                    <p className="approval-card-title">{p.title}</p>
                                    <p className="approval-card-artisan">by {p.artisan?.name || "Unknown"} · {p.category}</p>
                                    <p className="approval-card-price">₹{p.price}</p>
                                    {p.adminNote && (
                                        <p style={{ fontSize: "0.74rem", color: "#ef4444", marginBottom: "10px" }}>
                                            ❗ {p.adminNote}
                                        </p>
                                    )}
                                    <div className="approval-card-actions">
                                        {filter !== "approved" && (
                                            <button className="btn-approve" onClick={() => approve(p._id)}>✅ Approve</button>
                                        )}
                                        {filter !== "rejected" && (
                                            <button className="btn-reject" onClick={() => reject(p._id)}>❌ Reject</button>
                                        )}
                                        {filter === "rejected" && (
                                            <button className="btn-approve" onClick={() => approve(p._id)}>↩ Re-approve</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
