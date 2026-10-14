import { Link } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Brand + tagline */}
        <div style={styles.brand}>
          <div style={styles.brandName}>
            <span style={styles.brandPre}>THE</span> ROYAL
            <span style={styles.brandPost}>Oasis</span>
          </div>
          <p style={styles.tagline}>
            Luxury redefined. Every moment curated for your pleasure.
          </p>
          <div style={styles.socials}>
            <a href="#" aria-label="Instagram" style={styles.socialLink} title="Instagram">📸</a>
            <a href="#" aria-label="Facebook" style={styles.socialLink} title="Facebook">📘</a>
            <a href="#" aria-label="Twitter" style={styles.socialLink} title="Twitter">🐦</a>
            <a href="#" aria-label="LinkedIn" style={styles.socialLink} title="LinkedIn">💼</a>
          </div>
        </div>

        {/* Quick links */}
        <div style={styles.col}>
          <h4 style={styles.colTitle}>Quick Links</h4>
          <Link to="/" style={styles.footerLink}>Home</Link>
          <Link to="/rooms" style={styles.footerLink}>Rooms &amp; Suites</Link>
          <Link to="/restaurant" style={styles.footerLink}>Fine Dining</Link>
          <Link to="/services" style={styles.footerLink}>Hotel Services</Link>
          <Link to="/login" style={styles.footerLink}>Guest Login</Link>
          <Link to="/register" style={styles.footerLink}>Create Account</Link>
        </div>

        {/* Services */}
        <div style={styles.col}>
          <h4 style={styles.colTitle}>Our Services</h4>
          <span style={styles.footerText}>🧖 Luxury Spa &amp; Wellness</span>
          <span style={styles.footerText}>🏋️ Elite Fitness Center</span>
          <span style={styles.footerText}>👔 Valet Laundry</span>
          <span style={styles.footerText}>🚗 Airport Shuttle</span>
          <span style={styles.footerText}>🎊 Event &amp; Wedding Hall</span>
          <span style={styles.footerText}>🏊 Infinity Pool</span>
        </div>

        {/* Contact */}
        <div style={styles.col}>
          <h4 style={styles.colTitle}>Contact Us</h4>
          <span style={styles.footerText}>📍 123 Luxury Boulevard,<br />Palace District, Mumbai</span>
          <span style={styles.footerText}>📞 +91 9800-ROYAL-1</span>
          <span style={styles.footerText}>✉️ concierge@royaloasis.com</span>
          <span style={styles.footerText}>🕐 Check-in: 2:00 PM</span>
          <span style={styles.footerText}>🕛 Check-out: 12:00 PM</span>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={styles.bottomBar}>
        <p style={styles.copyright}>
          © {year} <strong style={{ color: "#c5a880" }}>The Royal Oasis</strong>. All rights reserved.
        </p>
        <div style={styles.bottomLinks}>
          <a href="#" style={styles.bottomLink}>Privacy Policy</a>
          <a href="#" style={styles.bottomLink}>Terms of Service</a>
          <a href="#" style={styles.bottomLink}>Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "rgba(5, 8, 15, 0.95)",
    borderTop: "1px solid rgba(197, 168, 128, 0.2)",
    marginTop: "60px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "60px 32px 40px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "40px",
  },
  brand: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  brandName: {
    color: "#fff",
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "2px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  brandPre: {
    fontSize: "12px",
    fontWeight: "400",
    color: "#c5a880",
    letterSpacing: "1px",
  },
  brandPost: {
    fontFamily: "'Playfair Display', serif",
    color: "#c5a880",
    fontStyle: "italic",
    fontWeight: "400",
    marginLeft: "4px",
  },
  tagline: {
    color: "#718096",
    fontSize: "14px",
    lineHeight: "1.6",
    maxWidth: "240px",
  },
  socials: {
    display: "flex",
    gap: "12px",
    marginTop: "4px",
  },
  socialLink: {
    fontSize: "20px",
    cursor: "pointer",
    transition: "transform 0.2s",
    display: "inline-block",
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  colTitle: {
    color: "#c5a880",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    marginBottom: "6px",
    fontFamily: "'Outfit', sans-serif",
  },
  footerLink: {
    color: "#a0aec0",
    fontSize: "14px",
    transition: "color 0.2s",
    textDecoration: "none",
  },
  footerText: {
    color: "#a0aec0",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  bottomBar: {
    borderTop: "1px solid rgba(255,255,255,0.05)",
    padding: "20px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  copyright: {
    color: "#4a5568",
    fontSize: "13px",
  },
  bottomLinks: {
    display: "flex",
    gap: "20px",
  },
  bottomLink: {
    color: "#4a5568",
    fontSize: "12px",
    textDecoration: "none",
  },
};

export default Footer;