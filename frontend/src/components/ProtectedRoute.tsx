import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
    allowedRoles?: string[];
    children?: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
    const { token, role, isInitialized } = useAuth();

    // Wait until auth state is fully read from localStorage before deciding
    // Without this, a page refresh can briefly show token=null and redirect to /login
    if (!isInitialized) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                background: "#f4f6f8",
                flexDirection: "column",
                gap: "12px",
                fontFamily: "'Segoe UI', sans-serif",
                color: "#7f8c8d"
            }}>
                <div style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid #e0e0e0",
                    borderTop: "4px solid #667eea",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span>Loading...</span>
            </div>
        );
    }

    if (!token) {
        // User is not logged in → redirect to login
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        // Logged in but wrong role → redirect to home
        return <Navigate to="/" replace />;
    }

    // Authorized ✓
    return children ? <>{children}</> : <Outlet />;
}
