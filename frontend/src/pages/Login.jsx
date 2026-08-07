import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      // Save token and user info inside AuthContext reactively
      login(res.data.access_token, {
        name: res.data.name,
        role: res.data.role,
        email: email
      });

      // Redirect depending on user role
      if (res.data.role === "admin") {
        navigate("/admin");
      } else if (res.data.role === "receptionist") {
        navigate("/reception");
      } else if (res.data.role === "housekeeping") {
        navigate("/housekeeping");
      } else {
        navigate("/dashboard");
      }
      
    } catch (error) {
      console.error(error);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Log in to access your luxury suite reservation dashboard.</p>
        
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} className="luxury-form">
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

          <div className="luxury-input-group">
            <div style={styles.passwordHeader}>
              <label>PASSWORD</label>
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot?</Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="luxury-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="gold-btn" style={styles.btn} disabled={loading}>
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <div style={styles.footerLink}>
          Don't have an account? <Link to="/register" style={styles.goldLink}>Register</Link>
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
    fontSize: "30px",
    color: "#fff",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#a0aec0",
    fontSize: "14px",
    marginBottom: "28px",
    lineHeight: "1.5",
  },
  error: {
    padding: "10px",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    borderRadius: "6px",
    color: "#ef4444",
    fontSize: "14px",
    marginBottom: "20px",
    textAlign: "left",
  },
  passwordHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotLink: {
    fontSize: "12px",
    color: "#c5a880",
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

export default Login;