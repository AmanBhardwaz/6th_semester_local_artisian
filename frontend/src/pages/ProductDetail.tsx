import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { token, role } = useAuth();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);

    // Reviews state
    const [reviews, setReviews] = useState<any[]>([]);
    const [avgRating, setAvgRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [myRating, setMyRating] = useState(0);
    const [myComment, setMyComment] = useState("");
    const [hoverRating, setHoverRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [reviewMsg, setReviewMsg] = useState<{ text: string; ok: boolean } | null>(null);

    useEffect(() => {
        axios.get(`${API}/api/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(() => navigate(-1))
            .finally(() => setLoading(false));

        fetchReviews();
    }, [id]);

    const fetchReviews = () => {
        axios.get(`${API}/api/reviews/${id}`)
            .then(res => {
                setReviews(res.data.reviews);
                setAvgRating(res.data.avgRating);
                setTotalReviews(res.data.totalReviews);
            })
            .catch(err => console.error(err));
    };

    const handleAdd = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleSubmitReview = async () => {
        if (!myRating) { setReviewMsg({ text: "Please select a star rating.", ok: false }); return; }
        setSubmitting(true); setReviewMsg(null);
        try {
            await axios.post(`${API}/api/reviews/${id}`,
                { rating: myRating, comment: myComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReviewMsg({ text: "✅ Review submitted!", ok: true });
            setMyRating(0); setMyComment("");
            fetchReviews();
        } catch (err: any) {
            setReviewMsg({ text: err?.response?.data?.message || "Failed to submit.", ok: false });
        } finally { setSubmitting(false); }
    };

    const renderStars = (rating: number, size = "1.2rem", interactive = false) => (
        <div style={{ display: "flex", gap: "4px" }}>
            {[1, 2, 3, 4, 5].map(star => (
                <span key={star}
                    onClick={interactive ? () => setMyRating(star) : undefined}
                    onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
                    onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
                    style={{
                        fontSize: size,
                        cursor: interactive ? "pointer" : "default",
                        color: star <= (interactive ? (hoverRating || myRating) : rating) ? "#f59e0b" : "#d1d5db",
                        transition: "color 0.15s",
                    }}>★</span>
            ))}
        </div>
    );

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f6fa" }}>
            <p style={{ color: "#888", fontSize: "1.2rem" }}>Loading product...</p>
        </div>
    );

    if (!product) return null;

    const initials = (name: string) => name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f5f6fa", fontFamily: "'Inter', sans-serif" }}>

            {/* Top Bar */}
            <div style={{ backgroundColor: "white", padding: "15px 40px", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <button onClick={() => navigate(-1)}
                    style={{ background: "none", border: "1px solid #ddd", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", color: "#555", fontSize: "0.9rem" }}>
                    ← Back
                </button>
                <span style={{ color: "#888", fontSize: "0.9rem" }}>Marketplace / {product.title}</span>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 20px", display: "flex", gap: "50px", alignItems: "flex-start", flexWrap: "wrap" }}>

                {/* Left — Image */}
                <div style={{ flex: "1 1 420px" }}>
                    <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.12)", backgroundColor: "white" }}>
                        <img src={product.image} alt={product.title}
                            style={{ width: "100%", height: "450px", objectFit: "cover", display: "block" }}
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/420x450?text=No+Image"; }} />
                    </div>
                </div>

                {/* Right — Details */}
                <div style={{ flex: "1 1 350px" }}>

                    {/* Seller badge */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#f0eeff", borderRadius: "20px", padding: "6px 14px", marginBottom: "15px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#667eea", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "0.8rem" }}>
                            {product.artisan?.name?.[0]?.toUpperCase() || "A"}
                        </div>
                        <span style={{ color: "#667eea", fontWeight: "600", fontSize: "0.9rem" }}>{product.artisan?.name || "Local Artisan"}</span>
                        <span style={{ color: "#aaa", fontSize: "0.8rem" }}>· Verified Seller ✓</span>
                    </div>

                    {/* Rating summary */}
                    {totalReviews > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                            {renderStars(avgRating)}
                            <span style={{ fontWeight: "bold", color: "#2c3e50" }}>{avgRating}</span>
                            <span style={{ color: "#888", fontSize: "0.85rem" }}>({totalReviews} review{totalReviews !== 1 ? "s" : ""})</span>
                        </div>
                    )}

                    <h1 style={{ margin: "0 0 15px 0", color: "#2c3e50", fontSize: "2rem", fontWeight: "800", lineHeight: 1.2 }}>{product.title}</h1>

                    {/* Price */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "25px" }}>
                        <span style={{ fontSize: "2.2rem", fontWeight: "800", color: "#667eea" }}>₹ {product.price}</span>
                        <span style={{ color: "#aaa", textDecoration: "line-through", fontSize: "1.1rem" }}>₹ {Math.round(product.price * 1.2)}</span>
                        <span style={{ backgroundColor: "#fef3cd", color: "#d97706", padding: "3px 10px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "bold" }}>20% OFF</span>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div style={{ marginBottom: "25px" }}>
                            <h4 style={{ margin: "0 0 8px 0", color: "#555" }}>About this product</h4>
                            <p style={{ margin: 0, color: "#666", lineHeight: 1.7, fontSize: "0.95rem" }}>{product.description}</p>
                        </div>
                    )}

                    {/* Highlights */}
                    <div style={{ backgroundColor: "#f9f9f9", borderRadius: "12px", padding: "20px", marginBottom: "25px" }}>
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
                        <button onClick={handleAdd}
                            style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "2px solid #667eea", backgroundColor: added ? "#667eea" : "white", color: added ? "white" : "#667eea", fontWeight: "bold", fontSize: "1rem", cursor: "pointer", transition: "all 0.3s" }}>
                            {added ? "✅ Added to Cart!" : "🛒 Add to Cart"}
                        </button>
                        <button onClick={() => { addToCart(product); navigate("/consumer/cart"); }}
                            style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "none", backgroundColor: "#667eea", color: "white", fontWeight: "bold", fontSize: "1rem", cursor: "pointer" }}>
                            Buy Now →
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== REVIEWS SECTION ===== */}
            <div style={{ maxWidth: "1100px", margin: "0 auto 60px auto", padding: "0 20px" }}>
                <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>

                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "10px" }}>
                        <h2 style={{ margin: 0, color: "#2c3e50", fontSize: "1.4rem" }}>
                            ⭐ Customer Reviews
                        </h2>
                        {totalReviews > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#f9fafb", padding: "12px 20px", borderRadius: "12px" }}>
                                <span style={{ fontSize: "2.5rem", fontWeight: "800", color: "#2c3e50" }}>{avgRating}</span>
                                <div>
                                    {renderStars(avgRating, "1.4rem")}
                                    <p style={{ margin: "4px 0 0 0", color: "#888", fontSize: "0.82rem" }}>{totalReviews} review{totalReviews !== 1 ? "s" : ""}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Write Review Form — only for consumers */}
                    {role === "consumer" && token && (
                        <div style={{ backgroundColor: "#f8faff", border: "1px solid #e8eeff", borderRadius: "16px", padding: "25px", marginBottom: "35px" }}>
                            <h3 style={{ margin: "0 0 15px 0", color: "#2c3e50", fontSize: "1rem" }}>✍️ Write a Review</h3>

                            {/* Star selector */}
                            <div style={{ marginBottom: "15px" }}>
                                <p style={{ margin: "0 0 8px 0", color: "#666", fontSize: "0.85rem" }}>Your rating *</p>
                                {renderStars(myRating, "2rem", true)}
                            </div>

                            <textarea
                                placeholder="Share your experience with this product... (optional)"
                                value={myComment}
                                onChange={e => setMyComment(e.target.value)}
                                style={{ width: "100%", minHeight: "90px", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }}
                            />

                            {reviewMsg && (
                                <p style={{ margin: "8px 0 0 0", color: reviewMsg.ok ? "#16a34a" : "#dc2626", fontSize: "0.9rem", fontWeight: "600" }}>
                                    {reviewMsg.text}
                                </p>
                            )}

                            <button onClick={handleSubmitReview} disabled={submitting}
                                style={{ marginTop: "12px", padding: "11px 28px", backgroundColor: submitting ? "#aaa" : "#667eea", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: submitting ? "not-allowed" : "pointer", fontSize: "0.9rem" }}>
                                {submitting ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    )}

                    {/* Reviews List */}
                    {reviews.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>💬</div>
                            <p>No reviews yet. Be the first to review!</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {reviews.map((r: any) => (
                                <div key={r._id} style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "20px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            {/* Avatar */}
                                            {r.consumer?.profilePhoto ? (
                                                <img src={r.consumer.profilePhoto} alt=""
                                                    style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                                            ) : (
                                                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#667eea", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "0.9rem" }}>
                                                    {initials(r.consumer?.name)}
                                                </div>
                                            )}
                                            <div>
                                                <p style={{ margin: 0, fontWeight: "600", color: "#2c3e50", fontSize: "0.95rem" }}>{r.consumer?.name || "Consumer"}</p>
                                                {renderStars(r.rating, "0.95rem")}
                                            </div>
                                        </div>
                                        <span style={{ color: "#bbb", fontSize: "0.8rem" }}>
                                            {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </span>
                                    </div>
                                    {r.comment && <p style={{ margin: "8px 0 0 0", color: "#555", fontSize: "0.9rem", lineHeight: 1.6 }}>{r.comment}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
