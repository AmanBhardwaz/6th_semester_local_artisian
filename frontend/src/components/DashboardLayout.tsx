import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const { role, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const menuItems = {
        admin: [
            { label: "Overview", path: "/admin" },
            { label: "Users", path: "/admin/users" },
            { label: "Settings", path: "/admin/settings" },
        ],
        artisan: [
            { label: "Dashboard", path: "/artisan" },
            { label: "My Products", path: "/artisan/products" },
            { label: "Orders", path: "/artisan/orders" },
            { label: "👤 My Profile", path: "/profile" },
        ],
        consumer: [
            { label: "Dashboard", path: "/consumer" },
            { label: "Marketplace", path: "/consumer/shop" },
            { label: "🛒 My Cart", path: "/consumer/cart" },
            { label: "My Orders", path: "/consumer/orders" },
            { label: "👤 My Profile", path: "/profile" },
        ]
    };

    const currentMenu = role ? menuItems[role as keyof typeof menuItems] || [] : [];

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f6f8", fontFamily: "'Segoe UI', sans-serif" }}>

            {/* Sidebar */}
            <div style={{
                width: "250px",
                backgroundColor: "#2c3e50",
                color: "white",
                display: "flex",
                flexDirection: "column",
                position: "fixed",
                height: "100vh",
                boxShadow: "2px 0 5px rgba(0,0,0,0.1)"
            }}>
                <div style={{ padding: "20px", fontSize: "1.5rem", fontWeight: "bold", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    LOCAL ARTISAN
                </div>

                <nav style={{ flex: 1, padding: "20px 0" }}>
                    {currentMenu.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: "block",
                                padding: "15px 25px",
                                color: location.pathname === item.path ? "#fff" : "#bdc3c7",
                                textDecoration: "none",
                                backgroundColor: location.pathname === item.path ? "#34495e" : "transparent",
                                borderLeft: location.pathname === item.path ? "4px solid #3498db" : "4px solid transparent",
                                transition: "all 0.2s"
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div style={{ padding: "20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ marginBottom: "10px", fontSize: "0.9rem", color: "#95a5a6" }}>Logged in as {role}</div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: "100%",
                            padding: "10px",
                            backgroundColor: "#c0392b",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, marginLeft: "250px", display: "flex", flexDirection: "column" }}>

                {/* Header */}
                <header style={{
                    height: "70px",
                    backgroundColor: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 40px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}>
                    <h2 style={{ margin: 0, color: "#2c3e50" }}>{title}</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#ecf0f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#7f8c8d", fontWeight: "bold" }}>
                            {role?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ padding: "40px", flex: 1 }}>
                    {children}
                </main>
            </div>

        </div>
    );
}
