import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
    allowedRoles?: string[];
    children?: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
    const { token, role } = useAuth();

    if (!token) {
        // User is not logged in, redirect to login
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        // User is logged in but doesn't have the right role, redirect to home
        return <Navigate to="/" replace />;
    }

    // Authorized
    return children ? <>{children}</> : <Outlet />;
}
