import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";

export default function MyProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/products/my`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setProducts(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout title="My Products">
            {loading ? (
                <p style={{ color: "#888" }}>Loading your products...</p>
            ) : products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#aaa" }}>
                    <div style={{ fontSize: "4rem" }}>📦</div>
                    <h3>No products yet</h3>
                    <p>Click "Add New Product" from the Dashboard to get started.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "25px" }}>
                    {products.map((p: any) => (
                        <div key={p._id} style={{ backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                            <div style={{ height: "180px", overflow: "hidden", backgroundColor: "#f0f0f0" }}>
                                <img
                                    src={p.image}
                                    alt={p.title}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/220x180?text=No+Image"; }}
                                />
                            </div>
                            <div style={{ padding: "15px" }}>
                                <h4 style={{ margin: "0 0 5px 0", color: "#2c3e50" }}>{p.title}</h4>
                                <p style={{ margin: "0 0 5px 0", color: "#7f8c8d", fontSize: "0.85rem" }}>{p.description || "No description"}</p>
                                <p style={{ margin: "0 0 15px 0", fontWeight: "bold", color: "#27ae60", fontSize: "1.1rem" }}>₹ {p.price}</p>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button style={{ flex: 1, padding: "8px", border: "1px solid #ddd", background: "none", borderRadius: "6px", cursor: "pointer", color: "#333" }}>Edit</button>
                                    <button style={{ flex: 1, padding: "8px", border: "none", background: "#fdecea", color: "#c0392b", borderRadius: "6px", cursor: "pointer" }}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}