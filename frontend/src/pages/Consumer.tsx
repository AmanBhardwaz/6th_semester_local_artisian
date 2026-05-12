import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { CATEGORIES, CATEGORY_NAMES } from "../constants/categories";

const BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/products`;

// Skeleton placeholder for loading state
function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <div className="skeleton-img" />
            <div className="skeleton-body">
                <div className="skeleton-line short" />
                <div className="skeleton-line medium" />
                <div className="skeleton-line long" />
            </div>
        </div>
    );
}

// Product card — shared between recommended & main grid
function ProductCard({ p, addedId, onAdd, onView }: {
    p: any; addedId: string | null;
    onAdd: (p: any) => void; onView: (id: string) => void;
}) {
    const meta = p._meta;
    return (
        <div className="prod-card">
            {/* Badges */}
            {meta?.isTrending && (
                <div style={{
                    position: "absolute", top: 10, left: 10, zIndex: 2,
                    background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                    color: "white", fontSize: "0.68rem", fontWeight: 800,
                    padding: "3px 9px", borderRadius: "12px",
                }}>🔥 Trending</div>
            )}
            {meta?.isNew && !meta?.isTrending && (
                <div style={{
                    position: "absolute", top: 10, left: 10, zIndex: 2,
                    background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                    color: "white", fontSize: "0.68rem", fontWeight: 800,
                    padding: "3px 9px", borderRadius: "12px",
                }}>✨ New</div>
            )}

            <div className="prod-img-wrap" onClick={() => onView(p._id)}>
                <img className="prod-img" src={p.image} alt={p.title}
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/240x200?text=No+Image"; }} />
            </div>

            <div className="prod-body" onClick={() => onView(p._id)}>
                {p.category && (
                    <span className="prod-badge">
                        {p.category}{p.subCategory ? ` › ${p.subCategory}` : ""}
                    </span>
                )}
                {/* Rating row */}
                {meta?.avgRating > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, margin: "4px 0 2px", fontSize: "0.76rem" }}>
                        <span style={{ color: "#f59e0b", letterSpacing: 1 }}>
                            {"★".repeat(Math.round(meta.avgRating))}{"☆".repeat(5 - Math.round(meta.avgRating))}
                        </span>
                        <span style={{ color: "#9ca3af" }}>({meta.reviewCount})</span>
                    </div>
                )}
                <div className="prod-title-row">
                    <h4 className="prod-title">{p.title}</h4>
                    <span className="prod-price">₹{p.price}</span>
                </div>
                <p className="prod-artisan">By {p.artisan?.name || "Unknown Artisan"}</p>
            </div>

            <div className="prod-footer">
                <button
                    className={`prod-add-btn${addedId === p._id ? " added" : " default"}`}
                    onClick={() => onAdd(p)}>
                    {addedId === p._id ? "✅ Added to Cart!" : "🛒 Add to Cart"}
                </button>
            </div>
        </div>
    );
}

export default function Consumer() {
    const { addToCart, cartCount } = useCart();
    const navigate = useNavigate();

    const [products, setProducts]         = useState<any[]>([]);
    const [recommended, setRecommended]   = useState<any[]>([]);
    const [loading, setLoading]           = useState(true);
    const [loadingRec, setLoadingRec]     = useState(true);
    const [addedId, setAddedId]           = useState<string | null>(null);

    // Filters
    const [search, setSearch]               = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSub, setSelectedSub]     = useState("");
    const [sortBy, setSortBy]               = useState("newest");
    const [priceRange, setPriceRange]       = useState("");

    useEffect(() => {
        // Load all products
        axios.get(BASE)
            .then(res => setProducts(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));

        // Load recommendations
        axios.get(`${BASE}/recommended?limit=8`)
            .then(res => setRecommended(res.data))
            .catch(console.error)
            .finally(() => setLoadingRec(false));
    }, []);

    const handleAddToCart = (p: any) => {
        addToCart(p);
        setAddedId(p._id);
        setTimeout(() => setAddedId(null), 1500);
    };

    // Apply filters
    let filtered = products.filter(p => {
        const matchSearch = !search ||
            p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.category?.toLowerCase().includes(search.toLowerCase()) ||
            p.subCategory?.toLowerCase().includes(search.toLowerCase()) ||
            p.artisan?.name?.toLowerCase().includes(search.toLowerCase());

        const matchCategory = !selectedCategory || p.category === selectedCategory;
        const matchSub      = !selectedSub || p.subCategory === selectedSub;

        const matchPrice = !priceRange || (() => {
            const price = p.price;
            if (priceRange === "under500")    return price < 500;
            if (priceRange === "500to2000")   return price >= 500 && price <= 2000;
            if (priceRange === "2000to5000")  return price > 2000 && price <= 5000;
            if (priceRange === "above5000")   return price > 5000;
            return true;
        })();

        return matchSearch && matchCategory && matchSub && matchPrice;
    });

    if (sortBy === "newest")    filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sortBy === "priceLow")  filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sortBy === "priceHigh") filtered = [...filtered].sort((a, b) => b.price - a.price);

    const resetFilters = () => {
        setSearch(""); setSelectedCategory(""); setSelectedSub(""); setSortBy("newest"); setPriceRange("");
    };

    const hasActiveFilters = search || selectedCategory || selectedSub || priceRange || sortBy !== "newest";

    return (
        <DashboardLayout title="Marketplace">

            {/* ── Search + Cart button ── */}
            <div className="mkt-search-bar">
                <input
                    className="mkt-search-input"
                    placeholder="🔍  Search products, categories, sellers..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="mkt-cart-btn" onClick={() => navigate("/consumer/cart")}>
                    🛒 Cart
                    {cartCount > 0 && <span className="mkt-cart-badge">{cartCount}</span>}
                </button>
            </div>

            {/* ══ RECOMMENDED SECTION ══════════════════════════ */}
            {!hasActiveFilters && (
                <div style={{ marginBottom: "32px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                        <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#1a1f3c" }}>
                            ✨ Recommended for You
                        </h3>
                        <span style={{
                            background: "#f5f3ff", color: "#7c3aed",
                            fontSize: "0.7rem", fontWeight: 700,
                            padding: "2px 8px", borderRadius: "10px"
                        }}>
                            AI Picks · 70:30 Algorithm
                        </span>
                    </div>

                    {loadingRec ? (
                        <div className="mkt-loading" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}>
                            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : recommended.length === 0 ? (
                        <p style={{ color: "#9ca3af", fontSize: "0.88rem" }}>No recommendations yet — shop more to personalise! 🛍️</p>
                    ) : (
                        <div className="mkt-grid" style={{ position: "relative" }}>
                            {recommended.map((p: any) => (
                                <div key={p._id} style={{ position: "relative" }}>
                                    <ProductCard p={p} addedId={addedId}
                                        onAdd={handleAddToCart}
                                        onView={id => navigate(`/product/${id}`)} />
                                </div>
                            ))}
                        </div>
                    )}

                    <hr style={{ border: "none", borderTop: "1.5px solid #f0f0f0", margin: "28px 0 20px" }} />
                    <h3 style={{ margin: "0 0 16px", fontSize: "1.05rem", fontWeight: 800, color: "#1a1f3c" }}>
                        🛍️ All Products
                    </h3>
                </div>
            )}

            {/* ── Filter row ── */}
            <div className="mkt-filter-row">
                <select className={`mkt-select${selectedCategory ? " active" : ""}`}
                    value={selectedCategory}
                    onChange={e => { setSelectedCategory(e.target.value); setSelectedSub(""); }}>
                    <option value="">All Categories</option>
                    {CATEGORY_NAMES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                {selectedCategory && (
                    <select className="mkt-select active" value={selectedSub}
                        onChange={e => setSelectedSub(e.target.value)}>
                        <option value="">All Sub-Categories</option>
                        {CATEGORIES[selectedCategory].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                )}

                <select className={`mkt-select${priceRange ? " active" : ""}`}
                    value={priceRange} onChange={e => setPriceRange(e.target.value)}>
                    <option value="">All Prices</option>
                    <option value="under500">Under ₹500</option>
                    <option value="500to2000">₹500 – ₹2,000</option>
                    <option value="2000to5000">₹2,000 – ₹5,000</option>
                    <option value="above5000">Above ₹5,000</option>
                </select>

                <select className="mkt-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="newest">Newest First</option>
                    <option value="priceLow">Price: Low → High</option>
                    <option value="priceHigh">Price: High → Low</option>
                </select>

                {hasActiveFilters && (
                    <button className="mkt-clear-btn" onClick={resetFilters}>✕ Clear</button>
                )}

                <span className="mkt-count">
                    {loading ? "Loading..." : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} found`}
                </span>
            </div>

            {/* ── Products Grid ── */}
            {loading ? (
                <div className="mkt-loading">
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="mkt-empty">
                    <div className="mkt-empty-icon">🛍️</div>
                    <p>No products found matching your filters.</p>
                    <button onClick={resetFilters} className="btn-primary"
                        style={{ fontSize: "0.9rem", padding: "10px 24px" }}>
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="mkt-grid">
                    {filtered.map((p: any) => (
                        <div key={p._id} style={{ position: "relative" }}>
                            <ProductCard p={p} addedId={addedId}
                                onAdd={handleAddToCart}
                                onView={id => navigate(`/product/${id}`)} />
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
