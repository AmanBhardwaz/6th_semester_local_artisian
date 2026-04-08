export default function Footer() {
    return (
        <footer style={{ backgroundColor: "#111", color: "#888", padding: "40px 20px", textAlign: "center" }}>
            <div style={{ marginBottom: "20px" }}>
                <h3 style={{ color: "white", marginBottom: "10px" }}>LOCAL ARTISAN</h3>
                <p>Connecting creators with connoisseurs.</p>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>
                <span>Instagram</span>
                <span>Twitter</span>
                <span>Facebook</span>
            </div>
            <p style={{ fontSize: "14px" }}>&copy; {new Date().getFullYear()} Local Artisan. All rights reserved.</p>
        </footer>
    );
}
