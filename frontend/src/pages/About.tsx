import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import communityImg from "../assets/community.png";
import aboutImg from "../assets/product_show.png";

export default function About() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* We need a darker navbar here effectively, or just reuse the transparent one with a dark background container */}
            <div style={{ backgroundColor: "#2c3e50" }}>
                <Navbar />
            </div>

            <div style={{ marginTop: "80px", flex: 1 }}> {/* Offset for fixed/absolute navbar */}

                {/* Hero Section */}
                <div style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    padding: "100px 20px",
                    textAlign: "center"
                }}>
                    <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>Our Mission</h1>
                    <p style={{ fontSize: "1.2rem", maxWidth: "800px", margin: "0 auto" }}>
                        To empower local artisans by providing them a global platform to showcase their craft,
                        while offering consumers access to unique, high-quality, handmade products.
                    </p>
                </div>

                {/* Content Section */}
                <div style={{ padding: "60px 20px", maxWidth: "1000px", margin: "0 auto" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", marginBottom: "60px" }}>
                        <div style={{ flex: 1, minWidth: "300px", padding: "20px" }}>
                            <h2 style={{ color: "#333", fontSize: "2rem" }}>Celebrating Craftsmanship</h2>
                            <p style={{ lineHeight: "1.6", color: "#666" }}>
                                We believe in the power of human hands. Every item on our platform tells a story of dedication,
                                skill, and tradition. By supporting local artisans, you are preserving cultural heritage
                                and supporting sustainable livelihoods.
                            </p>
                        </div>
                        <div style={{ flex: 1, minWidth: "300px", height: "300px", borderRadius: "10px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img src={aboutImg} alt="Craftsmanship" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap-reverse", alignItems: "center" }}>
                        <div style={{ flex: 1, minWidth: "300px", height: "300px", borderRadius: "10px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img src={communityImg} alt="Community" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: "300px", padding: "20px" }}>
                            <h2 style={{ color: "#333", fontSize: "2rem" }}>Community First</h2>
                            <p style={{ lineHeight: "1.6", color: "#666" }}>
                                Local Artisan is more than just a marketplace; it's a community. We foster connections
                                between makers and buyers, creating a space where appreciation for quality and
                                originality thrives.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
            <Footer />
        </div>
    );
}
