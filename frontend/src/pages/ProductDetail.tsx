import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(() => navigate(-1))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAdd = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f6fa" }}>
            <p style={{ color: "#888", fontSize: "1.2rem" }}>Loading product...</p>
        </div>
    );

    if (!product) return null;

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f5f6fa", fontFamily: "'Inter', sans-serif" }}>

            {/* Top Bar */}
            <div style={{ backgroundColor: "white", padding: "15px 40px", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <button onClick={() => navigate(-1)}
                    style={{ background: "none", border: "1px solid #ddd", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", color: "#555", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    ← Back
                </button>
                <span style={{ color: "#888", fontSize: "0.9rem" }}>Marketplace / {product.title}</span>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 20px", display: "flex", gap: "50px", alignItems: "flex-start", flexWrap: "wrap" }}>

                {/* Left — Image */}
                <div style={{ flex: "1 1 420px" }}>
                    <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.12)", backgroundColor: "white" }}>
                        <img
                            src={product.image}
                            alt={product.title}
                            style={{ width: "100%", height: "450px", objectFit: "cover", display: "block" }}
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/420x450?text=No+Image"; }}
                        />
                    </div>
                </div>

                {/* Right — Details */}
                <div style={{ flex: "1 1 350px" }}>

                    {/* Seller badge */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#f0eeff", borderRadius: "20px", padding: "6px 14px", marginBottom: "20px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#667eea", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "0.8rem" }}>
                            {product.artisan?.name?.[0]?.toUpperCase() || "A"}
                        </div>
                        <span style={{ color: "#667eea", fontWeight: "600", fontSize: "0.9rem" }}>
                            {product.artisan?.name || "Local Artisan"}
                        </span>
                        <span style={{ color: "#aaa", fontSize: "0.8rem" }}>· Verified Seller ✓</span>
                    </div>

                    {/* Title */}
                    <h1 style={{ margin: "0 0 15px 0", color: "#2c3e50", fontSize: "2rem", fontWeight: "800", lineHeight: 1.2 }}>
                        {product.title}
                    </h1>

                    {/* Price */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "25px" }}>
                        <span style={{ fontSize: "2.2rem", fontWeight: "800", color: "#667eea" }}>₹ {product.price}</span>
                        <span style={{ color: "#aaa", textDecoration: "line-through", fontSize: "1.1rem" }}>₹ {Math.round(product.price * 1.2)}</span>
                        <span style={{ backgroundColor: "#fef3cd", color: "#d97706", padding: "3px 10px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "bold" }}>20% OFF</span>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div style={{ marginBottom: "30px" }}>
                            <h4 style={{ margin: "0 0 8px 0", color: "#555" }}>About this product</h4>
                            <p style={{ margin: 0, color: "#666", lineHeight: 1.7, fontSize: "0.95rem" }}>{product.description}</p>
                        </div>
                    )}

                    {/* Highlights */}
                    <div style={{ backgroundColor: "#f9f9f9", borderRadius: "12px", padding: "20px", marginBottom: "30px" }}>
                        {[
                            { icon: "🤝", text: "Handmade by local artisan" },
                            { icon: "🚚", text: "Free delivery on orders above ₹500" },
                            { icon: "🔄", text: "7-day easy returns" },
                            { icon: "✅", text: "Quality guaranteed" },
                        ].map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: i < 3 ? "12px" : 0 }}>
                                <span>{item.icon}</span>
                                <span style={{ color: "#555", fontSize: "0.9rem" }}>{item.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: "15px" }}>
                        <button
                            onClick={handleAdd}
                            style={{
                                flex: 1, padding: "16px", borderRadius: "12px", border: "2px solid #667eea",
                                backgroundColor: added ? "#667eea" : "white",
                                color: added ? "white" : "#667eea",
                                fontWeight: "bold", fontSize: "1rem", cursor: "pointer", transition: "all 0.3s"
                            }}>
                            {added ? "✅ Added to Cart!" : "🛒 Add to Cart"}
                        </button>
                        <button
                            onClick={() => { addToCart(product); navigate("/consumer/cart"); }}
                            style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "none", backgroundColor: "#667eea", color: "white", fontWeight: "bold", fontSize: "1rem", cursor: "pointer" }}>
                            Buy Now →
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
