import { useState } from "react";
import { Login } from "../../../wailsjs/go/services/AuthService";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      await Login(username, password);
      alert("✅ Logged in successfully");
      // later: navigate to library
      onLogin();
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>MangaHub Login</h2>

        <input
          style={styles.input}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div style={styles.error}>{error}</div>}

        <button
          style={styles.button}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
  },
  card: {
    width: 320,
    padding: 24,
    background: "#020617",
    borderRadius: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    color: "#e5e7eb",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #334155",
    background: "#020617",
    color: "#e5e7eb",
    outline: "none",
  },
  button: {
    padding: "10px 12px",
    borderRadius: 6,
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  },
  error: {
    color: "#f87171",
    fontSize: 14,
  },
};
