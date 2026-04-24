import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/");
        setMenuOpen(false);
    };

    return (
        <>
            {/* ── Desktop Navbar ── */}
            <nav className="navbar">
                <Link to="/" className="navbar-logo">LOCAL ARTISAN</Link>

                {/* Desktop links */}
                <div className="navbar-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/about" className="nav-link">About</Link>

                    {token ? (
                        <button onClick={handleLogout} className="nav-btn-logout">Logout</button>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/signup">
                                <button className="nav-btn">Sign Up</button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Hamburger (mobile only) */}
                <button
                    className="nav-hamburger"
                    onClick={() => setMenuOpen(true)}
                    aria-label="Open menu"
                >
                    <span /><span /><span />
                </button>
            </nav>

            {/* ── Mobile Full-Screen Menu ── */}
            <div className={`navbar-mobile-menu${menuOpen ? " open" : ""}`}>
                <button
                    className="mobile-close-btn"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                >
                    ✕
                </button>

                <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link to="/about" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>About</Link>

                {token ? (
                    <button onClick={handleLogout} className="nav-btn-logout" style={{ fontSize: "1.1rem", padding: "12px 32px" }}>
                        Logout
                    </button>
                ) : (
                    <>
                        <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
                        <Link to="/signup" onClick={() => setMenuOpen(false)}>
                            <button className="btn-primary" style={{ fontSize: "1.1rem", padding: "13px 36px" }}>
                                Sign Up
                            </button>
                        </Link>
                    </>
                )}
            </div>
        </>
    );
}
