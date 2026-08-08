import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage("Invalid reset token. Please request another forgot password email.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/reset-password", {
        token: token,
        new_password: password
      });
      setSuccess(true);
      setMessage(res.data.message);
    } catch (error) {
      console.error(error);
      setMessage("Token is invalid or has expired. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>
        <p style={styles.subtitle}>Enter your new password below to update your credentials.</p>

        {message && (
          <div style={{
            ...styles.alert,
            borderColor: success ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)",
            color: success ? "#10b981" : "#ef4444",
            backgroundColor: success ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)"
          }}>
            {message}
          </div>
        )}

        {success ? (
          <div style={styles.successBlock}>
            <button onClick={() => navigate("/login")} className="gold-btn" style={styles.btn}>
              Proceed to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="luxury-form">
            <div className="luxury-input-group">
              <label>NEW PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                className="luxury-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!token}
              />
            </div>

            <div className="luxury-input-group">
              <label>CONFIRM NEW PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                className="luxury-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={!token}
              />
            </div>

            <button type="submit" className="gold-btn" style={styles.btn} disabled={loading || !token}>
              {loading ? "Resetting..." : "Save Password"}
            </button>
          </form>
        )}

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
    border: "1px solid",
    fontSize: "14px",
    marginBottom: "20px",
    textAlign: "left",
  },
  successBlock: {
    marginTop: "20px",
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

export default ResetPassword;
