import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { createProduct } from "../services/product.service";
import axios from "axios";
import { CATEGORIES, CATEGORY_NAMES } from "../constants/categories";

const API = "http://localhost:5000/api/products";
const ORDERS_API = "http://localhost:5000/api/orders";

export default function Artisan() {
    const { token } = useAuth();

    const [products, setProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);

    const pendingOrders = orders.filter(o => o.status !== "delivered").length;
    const totalSales = orders
        .flatMap(o => o.items)
        .reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    // ---- Add Product state ----
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // ---- Edit Product state ----
    const [showEditModal, setShowEditModal] = useState(false);
    const [editProduct, setEditProduct] = useState<any>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editSaving, setEditSaving] = useState(false);
    const [editMsg, setEditMsg] = useState("");

    const fetchProducts = () => {
        if (!token) return;
        setLoadingProducts(true);
        axios.get(`${API}/my`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setProducts(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoadingProducts(false));
    };

    const fetchOrders = () => {
        if (!token) return;
        axios.get(`${ORDERS_API}/artisan`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setOrders(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => { fetchProducts(); fetchOrders(); }, [token]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setImageFile(file);
        if (file) setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!title || !price || !imageFile) { setErrorMsg("Please fill all fields and select an image."); return; }
        if (!token) { setErrorMsg("Not authenticated."); return; }
        setUploading(true); setErrorMsg(""); setSuccessMsg("");
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("category", category);
            formData.append("subCategory", subCategory);
            formData.append("image", imageFile);
            await createProduct(formData, token);
            setSuccessMsg("Product uploaded successfully!");
            setTitle(""); setDescription(""); setPrice(""); setCategory(""); setSubCategory(""); setImageFile(null); setPreviewUrl(null);
            setTimeout(() => { setShowModal(false); setSuccessMsg(""); fetchProducts(); }, 1500);
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || "Upload failed. Try again.");
        } finally { setUploading(false); }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setProducts(prev => prev.filter(p => p._id !== id));
        } catch (err: any) {
            alert(err?.response?.data?.message || "Delete failed.");
        }
    };

    const openEdit = (p: any) => {
        setEditProduct(p);
        setEditTitle(p.title);
        setEditDescription(p.description || "");
        setEditPrice(String(p.price));
        setEditMsg("");
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        if (!editTitle || !editPrice) { setEditMsg("Title and Price are required."); return; }
        setEditSaving(true); setEditMsg("");
        try {
            const res = await axios.put(`${API}/${editProduct._id}`,
                { title: editTitle, description: editDescription, price: editPrice },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProducts(prev => prev.map(p => p._id === editProduct._id ? res.data : p));
            setEditMsg("✅ Updated!");
            setTimeout(() => { setShowEditModal(false); setEditMsg(""); }, 1000);
        } catch (err: any) {
            setEditMsg(err?.response?.data?.message || "Update failed.");
        } finally { setEditSaving(false); }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "12px", borderRadius: "8px",
        border: "1px solid #ddd", fontSize: "15px", marginBottom: "15px", boxSizing: "border-box",
    };

    return (
        <DashboardLayout title="Seller Dashboard">

            {/* Stats Row */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
                <div style={{ flex: 1, backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                    <h4 style={{ margin: "0 0 10px 0", color: "#888" }}>Total Products</h4>
                    <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#3498db" }}>{products.length}</p>
                </div>
                <div style={{ flex: 1, backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                    <h4 style={{ margin: "0 0 10px 0", color: "#888" }}>Total Sales</h4>
                    <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#2ecc71" }}>₹ {totalSales.toFixed(0)}</p>
                </div>
                <div style={{ flex: 1, backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                    <h4 style={{ margin: "0 0 10px 0", color: "#888" }}>Orders Pending</h4>
                    <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#f39c12" }}>{pendingOrders}</p>
                </div>
            </div>

            {/* Actions Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, color: "#333" }}>My Products</h3>
                <button onClick={() => setShowModal(true)}
                    style={{ padding: "10px 20px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                    + Add New Product
                </button>
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
                <p style={{ color: "#888" }}>Loading...</p>
            ) : products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#aaa", backgroundColor: "white", borderRadius: "10px" }}>
                    <div style={{ fontSize: "3rem" }}>📦</div>
                    <p>No products yet. Add your first product!</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
                    {products.map((p: any) => (
                        <div key={p._id} style={{ backgroundColor: "white", borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                            <div style={{ height: "150px", overflow: "hidden" }}>
                                <img src={p.image} alt={p.title}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/200x150?text=No+Image"; }} />
                            </div>
                            <div style={{ padding: "15px" }}>
                                <h4 style={{ margin: "0 0 2px 0", color: "#333" }}>{p.title}</h4>
                                {p.category && <p style={{ margin: "0 0 4px 0", fontSize: "0.75rem", color: "#999" }}>{p.category}{p.subCategory ? ` › ${p.subCategory}` : ""}</p>}
                                <p style={{ margin: 0, color: "#2ecc71", fontWeight: "bold" }}>₹ {p.price}</p>
                                <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                                    <button onClick={() => openEdit(p)}
                                        style={{ flex: 1, padding: "7px", border: "1px solid #3498db", background: "none", borderRadius: "5px", cursor: "pointer", color: "#3498db", fontWeight: "600" }}>
                                        ✏️ Edit
                                    </button>
                                    <button onClick={() => handleDelete(p._id)}
                                        style={{ flex: 1, padding: "7px", border: "none", background: "#fdecea", color: "#c0392b", borderRadius: "5px", cursor: "pointer", fontWeight: "600" }}>
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ---- Add Product Modal ---- */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ backgroundColor: "white", borderRadius: "15px", padding: "40px", width: "520px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                            <h3 style={{ margin: 0, color: "#2c3e50" }}>Add New Product</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
                        </div>

                        <input placeholder="Product Title *" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
                        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" } as React.CSSProperties} />
                        <input placeholder="Price (e.g. 99.99) *" type="number" value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} />

                        {/* Category */}
                        <select value={category} onChange={e => { setCategory(e.target.value); setSubCategory(""); }} style={{ ...inputStyle, cursor: "pointer" }}>
                            <option value="">-- Select Category --</option>
                            {CATEGORY_NAMES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>

                        {/* Sub-Category (cascading) */}
                        {category && (
                            <select value={subCategory} onChange={e => setSubCategory(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                                <option value="">-- Select Sub-Category --</option>
                                {CATEGORIES[category].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                        )}

                        {/* Image Upload */}
                        <label style={{ display: "block", marginBottom: "15px" }}>
                            <div style={{ border: "2px dashed #ddd", borderRadius: "8px", padding: "20px", textAlign: "center", cursor: "pointer", backgroundColor: "#f9f9f9" }}>
                                {previewUrl
                                    ? <img src={previewUrl} alt="Preview" style={{ maxHeight: "150px", objectFit: "cover", borderRadius: "5px" }} />
                                    : <div><div style={{ fontSize: "2rem", marginBottom: "10px" }}>📸</div><p style={{ margin: 0, color: "#888" }}>Click to select image *</p></div>}
                            </div>
                            <input type="file" accept="image/jpg,image/jpeg,image/png" onChange={handleFileChange} style={{ display: "none" }} />
                        </label>

                        {errorMsg && <p style={{ color: "#e74c3c", margin: "0 0 15px 0" }}>{errorMsg}</p>}
                        {successMsg && <p style={{ color: "#2ecc71", margin: "0 0 15px 0" }}>{successMsg}</p>}
                        <button onClick={handleSubmit} disabled={uploading}
                            style={{ width: "100%", padding: "15px", backgroundColor: uploading ? "#aaa" : "#3498db", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: uploading ? "not-allowed" : "pointer", fontWeight: "bold" }}>
                            {uploading ? "Uploading..." : "Upload Product"}
                        </button>
                    </div>
                </div>
            )}

            {/* ---- Edit Product Modal ---- */}
            {showEditModal && editProduct && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ backgroundColor: "white", borderRadius: "15px", padding: "40px", width: "500px", maxWidth: "95vw" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                            <h3 style={{ margin: 0, color: "#2c3e50" }}>Edit Product</h3>
                            <button onClick={() => setShowEditModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
                        </div>
                        <img src={editProduct.image} alt={editProduct.title} style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px", marginBottom: "20px" }} />
                        <input placeholder="Title *" value={editTitle} onChange={e => setEditTitle(e.target.value)} style={inputStyle} />
                        <textarea placeholder="Description" value={editDescription} onChange={e => setEditDescription(e.target.value)} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" } as React.CSSProperties} />
                        <input placeholder="Price *" type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} style={inputStyle} />
                        {editMsg && <p style={{ color: editMsg.startsWith("✅") ? "#2ecc71" : "#e74c3c", margin: "0 0 15px 0" }}>{editMsg}</p>}
                        <button onClick={handleUpdate} disabled={editSaving}
                            style={{ width: "100%", padding: "15px", backgroundColor: editSaving ? "#aaa" : "#2c3e50", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: editSaving ? "not-allowed" : "pointer", fontWeight: "bold" }}>
                            {editSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}
