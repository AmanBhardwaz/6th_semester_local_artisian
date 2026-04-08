import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { CATEGORIES, CATEGORY_NAMES } from "../constants/categories";

export default function Consumer() {
    const { addToCart, cartCount } = useCart();
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [addedId, setAddedId] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSub, setSelectedSub] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [priceRange, setPriceRange] = useState("");

    useEffect(() => {
        axios.get("http://localhost:5000/api/products")
            .then(res => setProducts(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleAddToCart = (p: any) => {
        addToCart(p);
        setAddedId(p._id);
        setTimeout(() => setAddedId(null), 1500);
    };

    // Apply all filters
    let filtered = products.filter(p => {
        const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.category?.toLowerCase().includes(search.toLowerCase()) ||
            p.subCategory?.toLowerCase().includes(search.toLowerCase()) ||
            p.artisan?.name?.toLowerCase().includes(search.toLowerCase());

        const matchCategory = !selectedCategory || p.category === selectedCategory;
        const matchSub = !selectedSub || p.subCategory === selectedSub;

        const matchPrice = !priceRange || (() => {
            const price = p.price;
            if (priceRange === "under500") return price < 500;
            if (priceRange === "500to2000") return price >= 500 && price <= 2000;
            if (priceRange === "2000to5000") return price > 2000 && price <= 5000;
            if (priceRange === "above5000") return price > 5000;
            return true;
        })();

        return matchSearch && matchCategory && matchSub && matchPrice;
    });

    // Sort
    if (sortBy === "newest") filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sortBy === "priceLow") filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sortBy === "priceHigh") filtered = [...filtered].sort((a, b) => b.price - a.price);

    const resetFilters = () => {
        setSearch(""); setSelectedCategory(""); setSelectedSub(""); setSortBy("newest"); setPriceRange("");
    };

    const hasActiveFilters = search || selectedCategory || selectedSub || priceRange || sortBy !== "newest";

    return (
        <DashboardLayout title="Marketplace">

            {/* Search Bar */}
            <div style={{ marginBottom: "15px", display: "flex", gap: "12px", alignItems: "center" }}>
                <input
                    placeholder="🔍  Search products, categories, sellers..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, padding: "14px 18px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "1rem", outline: "none" }}
                />
                <button onClick={() => navigate("/consumer/cart")}
                    style={{ position: "relative", padding: "13px 20px", backgroundColor: "#2c3e50", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "1rem", whiteSpace: "nowrap" }}>
                    🛒 Cart
                    {cartCount > 0 && (
                        <span style={{ position: "absolute", top: "-8px", right: "-8px", backgroundColor: "#e74c3c", color: "white", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "bold" }}>
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Filter Row */}
            <div style={{ marginBottom: "25px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                {/* Category */}
                <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setSelectedSub(""); }}
                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.9rem", cursor: "pointer" }}>
                    <option value="">All Categories</option>
                    {CATEGORY_NAMES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                {/* Sub-Category (cascading) */}
                {selectedCategory && (
                    <select value={selectedSub} onChange={e => setSelectedSub(e.target.value)}
                        style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #667eea", fontSize: "0.9rem", cursor: "pointer" }}>
                        <option value="">All Sub-Categories</option>
                        {CATEGORIES[selectedCategory].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                )}

                {/* Price Range */}
                <select value={priceRange} onChange={e => setPriceRange(e.target.value)}
                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.9rem", cursor: "pointer" }}>
                    <option value="">All Prices</option>
                    <option value="under500">Under ₹500</option>
                    <option value="500to2000">₹500 – ₹2,000</option>
                    <option value="2000to5000">₹2,000 – ₹5,000</option>
                    <option value="above5000">Above ₹5,000</option>
                </select>

                {/* Sort */}
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.9rem", cursor: "pointer" }}>
                    <option value="newest">Newest First</option>
                    <option value="priceLow">Price: Low → High</option>
                    <option value="priceHigh">Price: High → Low</option>
                </select>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button onClick={resetFilters}
                        style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #e74c3c", backgroundColor: "#fdecea", color: "#e74c3c", fontSize: "0.9rem", cursor: "pointer", fontWeight: "600" }}>
                        ✕ Clear
                    </button>
                )}
                <span style={{ color: "#888", fontSize: "0.85rem", marginLeft: "auto" }}>
                    {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
                </span>
            </div>

            {/* Products Grid */}
            {loading ? (
                <p style={{ color: "#888" }}>Loading marketplace...</p>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#aaa", backgroundColor: "white", borderRadius: "10px" }}>
                    <div style={{ fontSize: "3rem" }}>🛍️</div>
                    <p>No products found matching your filters.</p>
                    <button onClick={resetFilters} style={{ padding: "10px 20px", backgroundColor: "#667eea", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Clear Filters</button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "25px" }}>
                    {filtered.map((p: any) => (
                        <div key={p._id}
                            style={{ backgroundColor: "white", borderRadius: "15px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.06)", transition: "transform 0.2s" }}
                            onMouseOver={e => (e.currentTarget.style.transform = "translateY(-4px)")}
                            onMouseOut={e => (e.currentTarget.style.transform = "translateY(0)")}
                        >
                            <div onClick={() => navigate(`/product/${p._id}`)} style={{ cursor: "pointer" }}>
                                <div style={{ height: "190px", overflow: "hidden" }}>
                                    <img src={p.image} alt={p.title}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/240x190?text=No+Image"; }}
                                    />
                                </div>
                                <div style={{ padding: "15px 15px 0 15px" }}>
                                    {p.category && (
                                        <span style={{ fontSize: "0.72rem", color: "#667eea", backgroundColor: "#f0eeff", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                                            {p.category}{p.subCategory ? ` › ${p.subCategory}` : ""}
                                        </span>
                                    )}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", marginBottom: "4px" }}>
                                        <h4 style={{ margin: 0, color: "#2c3e50", fontSize: "1rem" }}>{p.title}</h4>
                                        <span style={{ fontWeight: "bold", color: "#667eea", fontSize: "0.95rem" }}>₹ {p.price}</span>
                                    </div>
                                    <p style={{ margin: "0 0 10px 0", color: "#95a5a6", fontSize: "0.82rem" }}>By {p.artisan?.name || "Unknown"}</p>
                                </div>
                            </div>
                            <div style={{ padding: "0 15px 15px 15px" }}>
                                <button onClick={() => handleAddToCart(p)}
                                    style={{ width: "100%", padding: "10px", backgroundColor: addedId === p._id ? "#2ecc71" : "#2c3e50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", transition: "background 0.3s" }}>
                                    {addedId === p._id ? "✅ Added!" : "Add to Cart"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
