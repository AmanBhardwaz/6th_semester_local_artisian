import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
}

const menuItems = {
    admin: [
        { icon: "📊", label: "Overview",    path: "/admin" },
        { icon: "👥", label: "Users",       path: "/admin/users" },
        { icon: "⚙️", label: "Settings",    path: "/admin/settings" },
    ],
    artisan: [
        { icon: "🏠", label: "Dashboard",   path: "/artisan" },
        { icon: "🛍️", label: "My Products", path: "/artisan/products" },
        { icon: "📦", label: "Orders",      path: "/artisan/orders" },
        { icon: "👤", label: "My Profile",  path: "/profile" },
    ],
    consumer: [
        { icon: "🏠", label: "Dashboard",   path: "/consumer" },
        { icon: "🛒", label: "Marketplace", path: "/consumer/shop" },
        { icon: "🛍️", label: "My Cart",     path: "/consumer/cart" },
        { icon: "📦", label: "My Orders",   path: "/consumer/orders" },
        { icon: "👤", label: "My Profile",  path: "/profile" },
    ],
};

// Icons for bottom mobile tab bar (consumer only — most used)
const mobileTabs = {
    consumer: [
        { icon: "🏠", label: "Home",      path: "/consumer" },
        { icon: "🛒", label: "Shop",      path: "/consumer/shop" },
        { icon: "🛍️", label: "Cart",      path: "/consumer/cart" },
        { icon: "📦", label: "Orders",    path: "/consumer/orders" },
        { icon: "👤", label: "Profile",   path: "/profile" },
    ],
    artisan: [
        { icon: "🏠", label: "Home",     path: "/artisan" },
        { icon: "🛍️", label: "Products", path: "/artisan/products" },
        { icon: "📦", label: "Orders",   path: "/artisan/orders" },
        { icon: "👤", label: "Profile",  path: "/profile" },
    ],
    admin: [
        { icon: "📊", label: "Overview", path: "/admin" },
        { icon: "👥", label: "Users",    path: "/admin/users" },
    ],
};

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const { role, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const currentMenu = role ? menuItems[role as keyof typeof menuItems] || [] : [];
    const currentMobileTabs = role ? mobileTabs[role as keyof typeof mobileTabs] || [] : [];
    const roleLabel = role?.charAt(0).toUpperCase() ?? "U";

    return (
        <div className="dash-shell">

            {/* ── Sidebar overlay (mobile tap-to-close) ── */}
            <div
                className={`dash-sidebar-overlay${sidebarOpen ? " open" : ""}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* ── Sidebar ── */}
            <aside className={`dash-sidebar${sidebarOpen ? " open" : ""}`}>

                <div className="dash-sidebar-brand">
                    <div className="dash-brand-logo">LOCAL ARTISAN</div>
                    <div className="dash-brand-role">{role} portal</div>
                </div>

                <nav className="dash-nav">
                    {currentMenu.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`dash-nav-item${location.pathname === item.path ? " active" : ""}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="dash-nav-icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="dash-sidebar-footer">
                    <div className="dash-user-info">
                        <div className="dash-avatar">{roleLabel}</div>
                        <div>
                            <div className="dash-user-label">Logged in as</div>
                            <div className="dash-user-role">{role}</div>
                        </div>
                    </div>
                    <button className="dash-logout-btn" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* ── Main area ── */}
            <div className="dash-main">

                {/* Sticky top header */}
                <header className="dash-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        {/* Hamburger — visible only on tablet/mobile */}
                        <button
                            className="dash-menu-toggle"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open sidebar"
                        >
                            ☰
                        </button>
                        <h2 className="dash-header-title">{title}</h2>
                    </div>

                    <div className="dash-header-right">
                        <div className="dash-header-avatar" title={role ?? ""}>
                            {roleLabel}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="dash-content">
                    {children}
                </main>
            </div>

            {/* ── Mobile bottom tab bar ── */}
            {currentMobileTabs.length > 0 && (
                <nav className="dash-mobile-tabs" aria-label="Mobile navigation">
                    <div className="dash-mobile-tabs-inner">
                        {currentMobileTabs.map(tab => (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                className={`mob-tab${location.pathname === tab.path ? " active" : ""}`}
                            >
                                <span className="tab-icon">{tab.icon}</span>
                                {tab.label}
                            </Link>
                        ))}
                    </div>
                </nav>
            )}
        </div>
    );
}
