import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const navStyle: React.CSSProperties = {
        position: "absolute",
        top: 0,
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)",
        color: "white",
        zIndex: 1000,
        boxSizing: "border-box", // Fix potential horizontal scrollbar
    };

    const linkStyle: React.CSSProperties = {
        color: "white",
        textDecoration: "none",
        margin: "0 15px",
        fontSize: "16px",
        fontWeight: "500",
        cursor: "pointer",
    };

    const buttonStyle: React.CSSProperties = {
        padding: "8px 20px",
        borderRadius: "20px",
        border: "2px solid white",
        backgroundColor: "rgba(255,255,255,0.1)",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold",
        marginLeft: "15px",
        transition: "all 0.3s ease",
    };

    return (
        <nav style={navStyle}>
            <div style={{ fontSize: "24px", fontWeight: "bold", letterSpacing: "1px" }}>
                <Link to="/" style={{ color: "white", textDecoration: "none" }}>LOCAL ARTISAN</Link>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
                <Link to="/" style={linkStyle}>Home</Link>
                <Link to="/about" style={linkStyle}>About</Link>

                {token ? (
                    <button onClick={handleLogout} style={{ ...buttonStyle, backgroundColor: "#e74c3c", border: "none" }}>Logout</button>
                ) : (
                    <div style={{ marginLeft: "20px" }}>
                        <Link to="/login" style={{ ...linkStyle, marginRight: 0 }}>Login</Link>
                        <Link to="/signup">
                            <button style={buttonStyle}>Sign Up</button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
