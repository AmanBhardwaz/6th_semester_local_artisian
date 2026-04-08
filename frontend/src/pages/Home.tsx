import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import videoBg from "../assets/Indian_Artisan_Video_Generation.mp4";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div>
            {/* Hero Section with Video Background */}
            <div style={{ position: "relative", height: "100vh", width: "100%", overflow: "hidden" }}>
                <video
                    src={videoBg}
                    autoPlay
                    loop
                    muted
                    style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        zIndex: -1
                    }}
                />

                {/* Overlay for readability */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0,0,0,0.4)",
                    zIndex: 0
                }}></div>

                <Navbar />

                {/* Hero Content */}
                <div style={{
                    position: "relative",
                    zIndex: 1,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",
                    textAlign: "center"
                }}>
                    <h1 style={{ fontSize: "4rem", marginBottom: "20px", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}>
                        Discover Local Artistry
                    </h1>
                    <p style={{ fontSize: "1.5rem", marginBottom: "40px", maxWidth: "600px" }}>
                        Connect with skilled artisans and find unique, handcrafted treasures.
                    </p>

                    <div style={{ display: "flex", gap: "20px" }}>
                        <button
                            onClick={() => navigate("/signup?role=consumer")}
                            style={{
                                padding: "15px 30px",
                                fontSize: "1.2rem",
                                backgroundColor: "#e74c3c",
                                color: "white",
                                border: "none",
                                borderRadius: "30px",
                                cursor: "pointer",
                                transition: "transform 0.2s"
                            }}
                        >
                            Start Shopping
                        </button>
                        <button
                            onClick={() => navigate("/signup?role=artisan")}
                            style={{
                                padding: "15px 30px",
                                fontSize: "1.2rem",
                                backgroundColor: "transparent",
                                color: "white",
                                border: "2px solid white",
                                borderRadius: "30px",
                                cursor: "pointer",
                                transition: "background 0.3s"
                            }}
                        >
                            Become a Seller
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div style={{ padding: "80px 20px", textAlign: "center", backgroundColor: "#f9f9f9" }}>
                <h2 style={{ fontSize: "2.5rem", color: "#333", marginBottom: "40px" }}>Why Local Artisan?</h2>

                <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "40px", maxWidth: "1200px", margin: "0 auto" }}>
                    <div style={{ flex: 1, minWidth: "300px", padding: "20px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                        <h3 style={{ fontSize: "1.5rem", marginBottom: "15px", color: "#e74c3c" }}>Unique Products</h3>
                        <p style={{ color: "#666", lineHeight: "1.6" }}>
                            Find one-of-a-kind items that you won't see in mass-market stores. Every piece has a story.
                        </p>
                    </div>
                    <div style={{ flex: 1, minWidth: "300px", padding: "20px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                        <h3 style={{ fontSize: "1.5rem", marginBottom: "15px", color: "#e74c3c" }}>Support Creators</h3>
                        <p style={{ color: "#666", lineHeight: "1.6" }}>
                            Your purchase directly supports independent artisans and helps preserve traditional crafts.
                        </p>
                    </div>
                    <div style={{ flex: 1, minWidth: "300px", padding: "20px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                        <h3 style={{ fontSize: "1.5rem", marginBottom: "15px", color: "#e74c3c" }}>Quality Assured</h3>
                        <p style={{ color: "#666", lineHeight: "1.6" }}>
                            We verify our sellers to ensure you receive high-quality, authentic handcrafted goods.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
