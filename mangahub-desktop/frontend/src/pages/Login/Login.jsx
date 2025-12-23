import { useState } from "react";
import { Login, Signup } from "../../../wailsjs/go/services/AuthService";

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setError(null);

    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    if (mode === "signup" && password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        await Login(username, password);
        alert("✅ Logged in successfully");
        onLogin();
      } else {
        await Signup(username, password);
        alert("🎉 Account created! You can now log in.");
        setMode("login");
        setPassword("");
        setConfirm("");
      }
    } catch (err) {
      setError(err?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.logoWrapper}>
        <span style={styles.logoIcon}>📚</span>
        <h1 style={styles.logo}>MangaHub</h1>
      </div>

      <div style={styles.card}>
        <h2 style={styles.title}>
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        <div style={styles.form}>
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

          {mode === "signup" && (
            <input
              style={styles.input}
              placeholder="Confirm Password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          )}

          {error && <div style={styles.error}>{error}</div>}

          <button
            style={styles.button}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Creating account..."
              : mode === "login"
              ? "Login"
              : "Sign Up"}
          </button>

          <div style={styles.switch}>
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <span
                  onClick={() => setMode("signup")}
                  style={styles.switchLink}
                >
                  Sign up
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  onClick={() => setMode("login")}
                  style={styles.switchLink}
                >
                  Login
                </span>
              </>
            )}
          </div>
        </div>
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
    flexDirection: "column",
    gap: 32,
    fontFamily:
      "'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
  },

  logoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 8,
  },

  logoIcon: {
    fontSize: 56,
    filter: "drop-shadow(0 4px 16px rgba(255, 182, 185, 0.5))",
  },

  logo: {
    margin: 0,
    fontSize: 48,
    fontWeight: 800,
    background:
      "linear-gradient(135deg, #ff6368 30%, #fad0c4 70%, #ffba85ff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textShadow: "0 4px 24px rgba(255, 154, 158, 0.4)",
    letterSpacing: "-1px",
  },

  card: {
    width: 380,
    padding: 40,
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 240, 245, 0.9) 100%)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: 32,
    boxShadow:
      "0 20px 60px rgba(255, 182, 185, 0.3), inset 0 1px 0 rgba(255, 255, 255, 1)",
    border: "2px solid rgba(255, 182, 185, 0.4)",
  },

  title: {
    textAlign: "center",
    marginBottom: 32,
    marginTop: 0,
    fontSize: 28,
    fontWeight: 700,
    background: "linear-gradient(135deg, #ff8ba7 0%, #ffc9a0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-0.5px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  input: {
    padding: "14px 20px",
    borderRadius: 50,
    border: "2px solid rgba(255, 182, 185, 0.4)",
    background: "rgba(255, 255, 255, 0.8)",
    color: "#ff6b9d",
    fontSize: 15,
    fontWeight: 500,
    outline: "none",
    transition: "all 0.3s ease",
    boxShadow: "inset 0 2px 8px rgba(255, 182, 185, 0.1)",
  },

  button: {
    padding: "14px 20px",
    borderRadius: 50,
    border: "2px solid rgba(255, 255, 255, 0.6)",
    background: "linear-gradient(135deg, #ffb6b9 0%, #ffc9a0 100%)",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow:
      "0 8px 24px rgba(255, 139, 167, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
    textShadow: "0 1px 2px rgba(255, 107, 157, 0.3)",
    marginTop: 8,
  },

  error: {
    color: "#ff6b9d",
    fontSize: 14,
    fontWeight: 600,
    textAlign: "center",
    padding: "10px 16px",
    background: "rgba(255, 107, 157, 0.1)",
    borderRadius: 50,
    border: "1px solid rgba(255, 107, 157, 0.3)",
  },

  switch: {
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
    color: "#ff8ba7",
    fontWeight: 500,
  },

  switchLink: {
    color: "#ff6b9d",
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "underline",
    textDecorationColor: "rgba(255, 107, 157, 0.3)",
    textUnderlineOffset: "2px",
  },
};
