import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/products`;

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: string }> = {
    pending:  { label: "Pending Approval", bg: "#fef3c7", color: "#b45309", icon: "⏳" },
    approved: { label: "Live",             bg: "#d1fae5", color: "#065f46", icon: "✅" },
    rejected: { label: "Rejected",         bg: "#fee2e2", color: "#991b1b", icon: "❌" },
};

export default function MyProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = () => {
        const token = localStorage.getItem("token");
        axios.get(`${API}/my`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setProducts(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setProducts(p => p.filter(x => x._id !== id));
        } catch (err: any) {
            alert(err?.response?.data?.message || "Delete failed.");
        }
    };

    // counts
    const counts = {
        total:    products.length,
        approved: products.filter(p => p.status === "approved").length,
        pending:  products.filter(p => p.status === "pending").length,
        rejected: products.filter(p => p.status === "rejected").length,
    };

    return (
        <DashboardLayout title="My Products">

            {/* ── Summary strip ── */}
            {!loading && products.length > 0 && (
                <div style={{ display: "flex", gap: "12px", marginBottom: "22px", flexWrap: "wrap" }}>
                    {[
                        { label: "Total",    val: counts.total,    bg: "#f5f3ff", color: "#7c3aed" },
                        { label: "Live",     val: counts.approved, bg: "#d1fae5", color: "#065f46" },
                        { label: "Pending",  val: counts.pending,  bg: "#fef3c7", color: "#b45309" },
                        { label: "Rejected", val: counts.rejected, bg: "#fee2e2", color: "#991b1b" },
                    ].map(s => (
                        <div key={s.label} style={{
                            background: s.bg, color: s.color,
                            padding: "10px 20px", borderRadius: "12px",
                            fontWeight: 700, fontSize: "0.88rem",
                            display: "flex", gap: "8px", alignItems: "center"
                        }}>
                            <span style={{ fontSize: "1.2rem", fontWeight: 800 }}>{s.val}</span>
                            <span>{s.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {loading ? (
                <p style={{ color: "#9ca3af" }}>Loading your products...</p>

            ) : products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "70px 20px", color: "#aaa" }}>
                    <div style={{ fontSize: "4rem" }}>📦</div>
                    <h3 style={{ color: "#6b7280" }}>No products yet</h3>
                    <p>Go to Dashboard and click "Add New Product" to get started.</p>
                </div>

            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
                    {products.map((p: any) => {
                        const status = p.status || "pending";
                        const cfg = statusConfig[status] || statusConfig.pending;

                        return (
                            <div key={p._id} style={{
                                background: "white", borderRadius: "16px",
                                overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                                border: `1.5px solid ${status === "rejected" ? "#fca5a5" : status === "approved" ? "#6ee7b7" : "#fde68a"}`,
                                transition: "box-shadow 0.2s",
                            }}>
                                {/* Status Banner */}
                                <div style={{
                                    background: cfg.bg, color: cfg.color,
                                    padding: "7px 14px", fontSize: "0.78rem", fontWeight: 700,
                                    display: "flex", alignItems: "center", gap: "6px"
                                }}>
                                    <span>{cfg.icon}</span>
                                    <span>{cfg.label}</span>
                                    {status === "pending" && (
                                        <span style={{ marginLeft: "auto", fontWeight: 400, fontSize: "0.72rem" }}>
                                            Visible to you only
                                        </span>
                                    )}
                                    {status === "approved" && (
                                        <span style={{ marginLeft: "auto", fontWeight: 400, fontSize: "0.72rem" }}>
                                            Visible to all buyers
                                        </span>
                                    )}
                                </div>

                                {/* Image */}
                                <div style={{ height: "170px", overflow: "hidden", background: "#f3f4f6" }}>
                                    <img src={p.image} alt={p.title}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/240x170?text=No+Image"; }} />
                                </div>

                                {/* Info */}
                                <div style={{ padding: "14px" }}>
                                    <h4 style={{ margin: "0 0 4px", color: "#1a1f3c", fontSize: "0.95rem",
                                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {p.title}
                                    </h4>
                                    <p style={{ margin: "0 0 6px", color: "#9ca3af", fontSize: "0.8rem" }}>
                                        {p.category || "Uncategorized"}
                                    </p>
                                    <p style={{ margin: "0 0 12px", fontWeight: 800, color: "#7c3aed", fontSize: "1.05rem" }}>
                                        ₹{p.price}
                                    </p>

                                    {/* Rejection reason */}
                                    {status === "rejected" && p.adminNote && (
                                        <p style={{ margin: "0 0 10px", fontSize: "0.76rem", color: "#ef4444",
                                            background: "#fef2f2", padding: "6px 10px", borderRadius: "6px" }}>
                                            ❗ Reason: {p.adminNote}
                                        </p>
                                    )}

                                    <button
                                        onClick={() => handleDelete(p._id, p.title)}
                                        style={{
                                            width: "100%", padding: "9px", border: "none",
                                            background: "#fef2f2", color: "#dc2626",
                                            borderRadius: "8px", cursor: "pointer",
                                            fontWeight: 600, fontSize: "0.85rem"
                                        }}>
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </DashboardLayout>
    );
}