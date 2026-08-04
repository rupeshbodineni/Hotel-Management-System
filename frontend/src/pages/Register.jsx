import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      await API.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      alert("Registration Successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.response?.data?.detail || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join us to enjoy exclusive booking benefits and loyalty rewards.</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={register} className="luxury-form">
          <div className="luxury-input-group">
            <label>FULL NAME</label>
            <input
              placeholder="John Doe"
              className="luxury-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            <label>PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••"
              className="luxury-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="luxury-input-group">
            <label>SELECT ROLE</label>
            <select
              className="luxury-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.select}
            >
              <option value="customer">Customer</option>
              <option value="receptionist">Receptionist</option>
              <option value="housekeeping">Housekeeping</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <button type="submit" className="gold-btn" style={styles.btn} disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div style={styles.footerLink}>
          Already have an account? <Link to="/login" style={styles.goldLink}>Login</Link>
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
  select: {
    backgroundColor: "#141a2b",
  }
};

export default Register;