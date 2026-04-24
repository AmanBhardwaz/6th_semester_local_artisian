import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import videoBg from "../assets/Indian_Artisan_Video_Generation.mp4";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div>
            {/* ── Hero Section ── */}
            <div className="hero-section">
                <video
                    src={videoBg}
                    autoPlay
                    loop
                    muted
                    playsInline          /* required for autoplay on iOS */
                    className="hero-video"
                />

                {/* Dark overlay */}
                <div className="hero-overlay" />

                <Navbar />

                {/* Hero Content */}
                <div className="hero-content">
                    <h1 className="hero-title">Discover Local Artistry</h1>
                    <p className="hero-subtitle">
                        Connect with skilled artisans and find unique, handcrafted treasures from across India.
                    </p>

                    <div className="hero-buttons">
                        <button
                            className="btn-primary"
                            onClick={() => navigate("/signup?role=consumer")}
                        >
                            Start Shopping
                        </button>
                        <button
                            className="btn-outline"
                            onClick={() => navigate("/signup?role=artisan")}
                        >
                            Become a Seller
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Features Section ── */}
            <section className="features-section">
                <h2 className="features-title">Why Local Artisan?</h2>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🏺</div>
                        <h3>Unique Products</h3>
                        <p>
                            Find one-of-a-kind items you won't see in mass-market stores.
                            Every piece has a story and a soul.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🤝</div>
                        <h3>Support Creators</h3>
                        <p>
                            Your purchase directly supports independent artisans and helps
                            preserve traditional Indian crafts for generations.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">✅</div>
                        <h3>Quality Assured</h3>
                        <p>
                            We verify our sellers to ensure you receive high-quality,
                            authentic handcrafted goods — every time.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
