import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="glass-panel" style={styles.nav}>
      <Link to="/" style={styles.brand}>
        <span style={styles.brandPre}>THE</span> ROYAL
        <span style={styles.brandPost}>Oasis</span>
      </Link>

      <div style={styles.links}>
        <Link style={styles.link} to="/">Home</Link>
        <Link style={styles.link} to="/rooms">Rooms</Link>
        <Link style={styles.link} to="/restaurant">Restaurant</Link>
        <Link style={styles.link} to="/services">Services</Link>

        {user && user.role === "admin" && (
          <Link style={styles.adminLink} to="/admin">Admin Panel</Link>
        )}
        {user && user.role === "receptionist" && (
          <Link style={styles.adminLink} to="/reception">Reception Desk</Link>
        )}
        {user && user.role === "housekeeping" && (
          <Link style={styles.adminLink} to="/housekeeping">Housekeeping</Link>
        )}
        {user && user.role === "customer" && (
          <Link style={styles.userLink} to="/dashboard">My Dashboard</Link>
        )}

        {!user ? (
          <>
            <Link style={styles.link} to="/login">Login</Link>
            <Link style={styles.goldBtn} to="/register">Register</Link>
          </>
        ) : (
          <div style={styles.userSection}>
            <span style={styles.userGreeting}>
              Hi, <span style={styles.userName}>{user.name}</span>
            </span>
            <button style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 40px",
    backgroundColor: "rgba(11, 15, 25, 0.95)",
    borderBottom: "1px solid rgba(197, 168, 128, 0.2)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    borderRadius: 0,
  },
  brand: {
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
  links: {
    display: "flex",
    gap: "24px",
    alignItems: "center",
  },
  link: {
    color: "#f5f7fa",
    fontSize: "15px",
    fontWeight: "500",
    transition: "color 0.3s",
  },
  adminLink: {
    color: "#f59e0b",
    fontSize: "15px",
    fontWeight: "600",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    padding: "6px 12px",
    borderRadius: "4px",
    backgroundColor: "rgba(245, 158, 11, 0.05)",
  },
  userLink: {
    color: "#3b82f6",
    fontSize: "15px",
    fontWeight: "600",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    padding: "6px 12px",
    borderRadius: "4px",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
  },
  goldBtn: {
    background: "linear-gradient(135deg, #c5a880, #e0c8a5)",
    color: "#0b0f19",
    fontWeight: "600",
    fontSize: "14px",
    padding: "8px 16px",
    borderRadius: "6px",
    boxShadow: "0 2px 8px rgba(197, 168, 128, 0.2)",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  userGreeting: {
    color: "#a0aec0",
    fontSize: "14px",
  },
  userName: {
    color: "#c5a880",
    fontWeight: "600",
  },
  logoutBtn: {
    backgroundColor: "transparent",
    color: "#ef4444",
    border: "1.5px solid #ef4444",
    padding: "6px 14px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s",
  },
};

export default Navbar;