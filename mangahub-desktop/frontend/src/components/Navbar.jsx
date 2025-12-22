export default function Navbar({ current, onChange }) {
  return (
    <div style={styles.nav}>
      <h2 style={styles.logo}>📚 MangaHub</h2>

      <div style={styles.links}>
        <button onClick={() => onChange("home")}
          style={current === "home" ? styles.active : styles.btn}>
          Home
        </button>

        <button onClick={() => onChange("library")}
          style={current === "library" ? styles.active : styles.btn}>
          Library
        </button>

        <button onClick={() => onChange("chat")}
          style={current === "chat" ? styles.active : styles.btn}>
          Chat Room
        </button>
      </div>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 20px",
    background: "#1b263b",
    color: "#fff",
    alignItems: "center"
  },
  logo: { margin: 0 },
  links: { display: "flex", gap: 10 },
  btn: {
    background: "transparent",
    border: "1px solid #415a77",
    color: "#fff",
    padding: "6px 12px",
    cursor: "pointer"
  },
  active: {
    background: "#415a77",
    border: "none",
    color: "#fff",
    padding: "6px 12px",
    cursor: "pointer"
  }
};
