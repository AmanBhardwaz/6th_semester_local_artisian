export default function Footer() {
    return (
        <footer className="footer">
            <div>
                <h3 className="footer-logo">LOCAL ARTISAN</h3>
                <p className="footer-tagline">Connecting creators with connoisseurs.</p>
            </div>

            <div className="footer-socials">
                <span>📸 Instagram</span>
                <span>🐦 Twitter</span>
                <span>📘 Facebook</span>
            </div>

            <p className="footer-copy">
                &copy; {new Date().getFullYear()} Local Artisan. All rights reserved.
            </p>
        </footer>
    );
}
