import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { CATEGORIES, CATEGORY_NAMES } from "../constants/categories";

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
        axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/products`)
            .then(res => setProducts(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
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
        const matchSub = !selectedSub || p.subCategory === selectedSub;

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

    // Sort
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
                    {cartCount > 0 && (
                        <span className="mkt-cart-badge">{cartCount}</span>
                    )}
                </button>
            </div>

            {/* ── Filter row ── */}
            <div className="mkt-filter-row">
                {/* Category */}
                <select
                    className={`mkt-select${selectedCategory ? " active" : ""}`}
                    value={selectedCategory}
                    onChange={e => { setSelectedCategory(e.target.value); setSelectedSub(""); }}
                >
                    <option value="">All Categories</option>
                    {CATEGORY_NAMES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                {/* Sub-category (cascading) */}
                {selectedCategory && (
                    <select
                        className="mkt-select active"
                        value={selectedSub}
                        onChange={e => setSelectedSub(e.target.value)}
                    >
                        <option value="">All Sub-Categories</option>
                        {CATEGORIES[selectedCategory].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                )}

                {/* Price range */}
                <select
                    className={`mkt-select${priceRange ? " active" : ""}`}
                    value={priceRange}
                    onChange={e => setPriceRange(e.target.value)}
                >
                    <option value="">All Prices</option>
                    <option value="under500">Under ₹500</option>
                    <option value="500to2000">₹500 – ₹2,000</option>
                    <option value="2000to5000">₹2,000 – ₹5,000</option>
                    <option value="above5000">Above ₹5,000</option>
                </select>

                {/* Sort */}
                <select
                    className="mkt-select"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                >
                    <option value="newest">Newest First</option>
                    <option value="priceLow">Price: Low → High</option>
                    <option value="priceHigh">Price: High → Low</option>
                </select>

                {/* Clear */}
                {hasActiveFilters && (
                    <button className="mkt-clear-btn" onClick={resetFilters}>
                        ✕ Clear
                    </button>
                )}

                <span className="mkt-count">
                    {loading ? "Loading..." : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} found`}
                </span>
            </div>

            {/* ── Products ── */}
            {loading ? (
                <div className="mkt-loading">
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="mkt-empty">
                    <div className="mkt-empty-icon">🛍️</div>
                    <p>No products found matching your filters.</p>
                    <button
                        onClick={resetFilters}
                        className="btn-primary"
                        style={{ fontSize: "0.9rem", padding: "10px 24px" }}
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="mkt-grid">
                    {filtered.map((p: any) => (
                        <div key={p._id} className="prod-card">

                            {/* Image */}
                            <div
                                className="prod-img-wrap"
                                onClick={() => navigate(`/product/${p._id}`)}
                            >
                                <img
                                    className="prod-img"
                                    src={p.image}
                                    alt={p.title}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            "https://via.placeholder.com/240x200?text=No+Image";
                                    }}
                                />
                            </div>

                            {/* Body */}
                            <div
                                className="prod-body"
                                onClick={() => navigate(`/product/${p._id}`)}
                            >
                                {p.category && (
                                    <span className="prod-badge">
                                        {p.category}{p.subCategory ? ` › ${p.subCategory}` : ""}
                                    </span>
                                )}
                                <div className="prod-title-row">
                                    <h4 className="prod-title">{p.title}</h4>
                                    <span className="prod-price">₹{p.price}</span>
                                </div>
                                <p className="prod-artisan">By {p.artisan?.name || "Unknown Artisan"}</p>
                            </div>

                            {/* Add to cart */}
                            <div className="prod-footer">
                                <button
                                    className={`prod-add-btn${addedId === p._id ? " added" : " default"}`}
                                    onClick={() => handleAddToCart(p)}
                                >
                                    {addedId === p._id ? "✅ Added to Cart!" : "🛒 Add to Cart"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
