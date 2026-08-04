import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
      if (res.data.reset_token) {
        // Expose reset link directly on frontend for easy testing
        setResetLink(`http://localhost:5173/reset-password?token=${res.data.reset_token}`);
      }
    } catch (error) {
      setMessage("Failed to send reset link. Please check the email.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <h2 style={styles.title}>Forgot Password</h2>
        <p style={styles.subtitle}>Enter your email address to receive a secure password reset link.</p>
        
        {message && (
          <div style={{ ...styles.alert, backgroundColor: "rgba(197, 168, 128, 0.1)" }}>
            {message}
          </div>
        )}

        {resetLink && (
          <div style={styles.mockLinkContainer}>
            <p style={styles.mockTitle}>[DEVELOPER TEST LINK]</p>
            <a href={resetLink} style={styles.mockLink}>{resetLink}</a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="luxury-form">
          <div className="luxury-input-group">
            <label>EMAIL ADDRESS</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="luxury-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="gold-btn" style={styles.btn} disabled={loading}>
            {loading ? "Processing..." : "Generate Reset Link"}
          </button>
        </form>

        <div style={styles.footerLink}>
          Back to <Link to="/login" style={styles.goldLink}>Login</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
  },
  card: {
    maxWidth: "450px",
    width: "100%",
    padding: "40px",
    textAlign: "center",
  },
  title: {
    fontSize: "28px",
    color: "#fff",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#a0aec0",
    fontSize: "14px",
    marginBottom: "24px",
    lineHeight: "1.5",
  },
  alert: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid rgba(197, 168, 128, 0.3)",
    color: "#c5a880",
    fontSize: "14px",
    marginBottom: "20px",
    textAlign: "left",
  },
  mockLinkContainer: {
    padding: "12px",
    background: "rgba(16, 185, 129, 0.1)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    borderRadius: "6px",
    fontSize: "12px",
    marginBottom: "20px",
    textAlign: "left",
    wordBreak: "break-all"
  },
  mockTitle: {
    color: "#10b981",
    fontWeight: "700",
    marginBottom: "4px"
  },
  mockLink: {
    color: "#34d399",
    textDecoration: "underline"
  },
  btn: {
    width: "100%",
    justifyContent: "center",
  },
  footerLink: {
    marginTop: "24px",
    fontSize: "14px",
    color: "#a0aec0",
  },
  goldLink: {
    color: "#c5a880",
    fontWeight: "600",
  },
};

export default ForgotPassword;
