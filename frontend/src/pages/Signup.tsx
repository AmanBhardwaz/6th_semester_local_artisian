import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    // Initialize role from URL, but allow it to be null
    const [role, setRole] = useState<string | null>(searchParams.get("role"));

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");

    // Update role if URL changes
    useEffect(() => {
        const queryRole = searchParams.get("role");
        if (queryRole) setRole(queryRole);
    }, [searchParams]);

    const handleSignup = async () => {
        if (!role) return;
        try {
            const res = await registerUser(name, email, password, phone, role);
            login(res.token, res.role);

            if (res.role === "admin") navigate("/admin");
            else if (res.role === "artisan") navigate("/artisan");
            else navigate("/consumer");
        } catch (error) {
            alert("Signup failed! Try again.");
        }
    };

    const containerStyle: React.CSSProperties = {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    };

    const cardStyle: React.CSSProperties = {
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "20px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        maxWidth: "500px",
        width: "100%",
        textAlign: "center"
    };

    const inputStyle: React.CSSProperties = {
        display: "block",
        width: "100%",
        padding: "15px",
        margin: "15px 0",
        borderRadius: "10px",
        border: "1px solid #ddd",
        fontSize: "16px",
        boxSizing: "border-box"
    };

    const buttonStyle: React.CSSProperties = {
        width: "100%",
        padding: "15px",
        backgroundColor: "#667eea",
        color: "white",
        border: "none",
        borderRadius: "10px",
        fontSize: "18px",
        cursor: "pointer",
        marginTop: "20px",
        fontWeight: "bold",
        transition: "background 0.3s"
    };

    const backButtonStyle: React.CSSProperties = {
        background: "none",
        border: "none",
        color: "#666",
        cursor: "pointer",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        fontSize: "14px"
    };

    const choiceCardStyle: React.CSSProperties = {
        padding: "30px",
        borderRadius: "15px",
        border: "2px solid #eee",
        cursor: "pointer",
        marginBottom: "20px",
        transition: "all 0.3s ease",
        backgroundColor: "#f9f9f9"
    };

    // If no role is selected, show role selection
    if (!role) {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <button onClick={() => navigate("/")} style={backButtonStyle}>
                        &larr; Back to Home
                    </button>
                    <h2 style={{ color: "#333", marginBottom: "30px" }}>Join Local Artisan</h2>
                    <p style={{ color: "#666", marginBottom: "30px" }}>Choose how you want to use the platform</p>

                    <div
                        style={choiceCardStyle}
                        onClick={() => setRole("consumer")}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = "#667eea"}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = "#eee"}
                    >
                        <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Check Out as/Sign Up as Consumer</h3>
                        <p style={{ margin: 0, color: "#888", fontSize: "14px" }}>Buy unique handcrafted items</p>
                    </div>

                    <div
                        style={choiceCardStyle}
                        onClick={() => setRole("artisan")}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = "#764ba2"}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = "#eee"}
                    >
                        <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Become a Seller</h3>
                        <p style={{ margin: 0, color: "#888", fontSize: "14px" }}>Sell your creations to the world</p>
                    </div>
                </div>
            </div>
        );
    }

    // Role is selected, show form
    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <button onClick={() => setRole(null)} style={backButtonStyle}>
                    &larr; Back to Selection
                </button>

                <h2 style={{ color: "#333", marginBottom: "10px" }}>
                    {role === "artisan" ? "Seller" : "Consumer"} Sign Up
                </h2>
                <p style={{ color: "#888", marginBottom: "30px" }}>Create your account to get started</p>

                <input
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                />
                <input
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                />
                <input
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={inputStyle}
                />
                <input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                />

                <button onClick={handleSignup} style={buttonStyle}>
                    Create Account
                </button>

                <p style={{ marginTop: "20px", color: "#666", fontSize: "14px" }}>
                    Already have an account? <span onClick={() => navigate("/login")} style={{ color: "#667eea", cursor: "pointer", fontWeight: "bold" }}>Login</span>
                </p>
            </div>
        </div>
    );
}
