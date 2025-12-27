import { useEffect, useState } from "react";
import { IsAdmin, Logout } from "../../wailsjs/go/services/AuthService";

export default function Navbar({ current, onChange, onLogout }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const adminStatus = await IsAdmin();
      setIsAdmin(adminStatus);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    try {
      await Logout();
      if (onLogout) onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div style={styles.nav}>
      <h2 style={styles.logo}>
        <span style={styles.logoIcon}>📚</span>
        <span style={styles.logoText}>MangaHub</span>
      </h2>

      <div style={styles.links}>
        <button
          onClick={() => onChange("home")}
          style={
            current === "home"
              ? { ...styles.btn, ...styles.active }
              : styles.btn
          }
        >
          <span style={styles.btnText}>Home</span>
        </button>

        <button
          onClick={() => onChange("library")}
          style={
            current === "library"
              ? { ...styles.btn, ...styles.active }
              : styles.btn
          }
        >
          <span style={styles.btnText}>Library</span>
        </button>

        <button
          onClick={() => onChange("chat")}
          style={
            current === "chat"
              ? { ...styles.btn, ...styles.active }
              : styles.btn
          }
        >
          <span style={styles.btnText}>Chat Room</span>
        </button>

        <button
          onClick={() => onChange("internal")}
          style={
            current === "internal"
              ? { ...styles.btn, ...styles.active }
              : styles.btn
          }
        >
          <span style={styles.btnText}>Internal Service</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => onChange("admin")}
            style={
              current === "admin"
                ? { ...styles.btn, ...styles.active }
                : styles.btn
            }
          >
            <span style={styles.btnText}>Admin</span>
          </button>
        )}

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <span style={styles.logoutText}>Logout</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 28px",
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 240, 245, 0.5) 100%)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "2px solid rgba(255, 182, 185, 0.3)",
    alignItems: "center",
    boxShadow:
      "0 4px 24px rgba(255, 182, 185, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
    fontFamily:
      "'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
  },

  logo: {
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "-0.5px",
  },

  logoIcon: {
    fontSize: 32,
    filter: "drop-shadow(0 2px 8px rgba(255, 182, 185, 0.4))",
  },

  logoText: {
    fontSize: 36,
    fontWeight: 800,
    background:
      "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #ffc9a0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textShadow: "0 2px 12px rgba(255, 154, 158, 0.3)",
  },

  links: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },

  btn: {
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(8px)",
    border: "2px solid rgba(255, 182, 185, 0.4)",
    borderRadius: 50,
    padding: "10px 24px",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
    transition: "all 0.3s ease",
    boxShadow:
      "0 4px 12px rgba(255, 182, 185, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
  },

  btnText: {
    background: "linear-gradient(135deg, #ff8ba7 0%, #ffc9a0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  active: {
    background: "linear-gradient(135deg, #ffb6b9 0%, #ffc9a0 100%)",
    border: "2px solid rgba(255, 255, 255, 0.6)",
    boxShadow:
      "0 6px 20px rgba(255, 139, 167, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
    transform: "translateY(-2px)",
  },

  logoutBtn: {
    background: "rgba(255, 107, 141, 0.2)",
    backdropFilter: "blur(8px)",
    border: "2px solid rgba(255, 107, 141, 0.4)",
    borderRadius: 50,
    padding: "10px 24px",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
    transition: "all 0.3s ease",
    boxShadow:
      "0 4px 12px rgba(255, 107, 141, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
    marginLeft: 8,
  },

  logoutText: {
    color: "#ff6b8d",
    fontWeight: 700,
  },
};
