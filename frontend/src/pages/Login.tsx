import { useState } from "react";
import { loginUser, googleLogin } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await loginUser(email, password);
            login(res.token, res.role);

            if (res.role === "admin") navigate("/admin");
            else if (res.role === "artisan") navigate("/artisan");
            else navigate("/consumer");
        } catch (error) {
            alert("Login failed! Check credentials.");
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
        maxWidth: "400px",
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
        marginTop: "10px",
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

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <button onClick={() => navigate("/")} style={backButtonStyle}>
                    &larr; Back to Home
                </button>

                <h2 style={{ color: "#333", marginBottom: "10px" }}>Welcome Back</h2>
                <p style={{ color: "#888", marginBottom: "30px" }}>Login to your account</p>

                <input
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                />
                <input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                />

                <button onClick={handleLogin} style={buttonStyle}>Login</button>

                <div style={{ margin: "20px 0", display: "flex", alignItems: "center", color: "#888" }}>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}></div>
                    <span style={{ padding: "0 10px", fontSize: "14px" }}>OR</span>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}></div>
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                    <GoogleLogin
                        onSuccess={async (cred) => {
                            try {
                                const res = await googleLogin(cred.credential!);
                                login(res.token, res.role);

                                if (res.role === "admin") navigate("/admin");
                                else if (res.role === "artisan") navigate("/artisan");
                                else navigate("/consumer");
                            } catch (error) {
                                alert("Google login failed");
                            }
                        }}
                        onError={() => alert("Google login failed")}
                    />
                </div>

                <p style={{ marginTop: "20px", color: "#666", fontSize: "14px" }}>
                    Don't have an account? <span onClick={() => navigate("/signup")} style={{ color: "#667eea", cursor: "pointer", fontWeight: "bold" }}>Sign Up</span>
                </p>
            </div>
        </div>
    );
}
