import {
  List,
  Add,
  Update,
  Remove,
} from "../../../wailsjs/go/services/LibraryService";
import { useEffect, useState } from "react";

export default function LibraryPage() {
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async (status = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await List(status);
      setLibrary(data);
    } catch (err) {
      setError(err?.message || "Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  // ---- actions ----

  const addManga = async (mangaId) => {
    try {
      await Add(mangaId, "plan_to_read", null);
      await loadLibrary();
    } catch (err) {
      alert(err?.message || "Add failed");
    }
  };

  const updateStatus = async (mangaId, status) => {
    try {
      await Update(mangaId, status);
      await loadLibrary();
    } catch (err) {
      alert(err?.message || "Update failed");
    }
  };

  const removeManga = async (mangaId) => {
    if (!confirm("Remove this manga from library?")) return;
    try {
      await Remove(mangaId);
      await loadLibrary();
    } catch (err) {
      alert(err?.message || "Remove failed");
    }
  };

  // ---- UI states ----

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.loadingBubble}>Loading library...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <div style={styles.errorBox}>
          <div style={styles.errorText}>{error}</div>
          <button style={styles.retryButton} onClick={() => loadLibrary()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📚 Your Library</h1>
      </div>

      <Section
        title="Currently Reading"
        items={library?.reading}
        showChapter
        onUpdate={updateStatus}
        onRemove={removeManga}
      />

      <Section
        title="Completed"
        items={library?.completed}
        onUpdate={updateStatus}
        onRemove={removeManga}
      />

      <Section
        title="Plan to Read"
        items={library?.plan_to_read}
        onUpdate={updateStatus}
        onRemove={removeManga}
      />
    </div>
  );
}

function Section({ title, items, showChapter, onUpdate, onRemove }) {
  if (!items || items.length === 0) {
    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <div style={styles.empty}>No items</div>
      </div>
    );
  }

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <ul style={styles.list}>
        {items.map((item) => (
          <li key={item.manga_id} style={styles.item}>
            <div style={styles.itemInfo}>
              <strong style={styles.mangaTitle}>{item.manga_id}</strong>
              {showChapter && (
                <span style={styles.chapter}>
                  ch {item.current_chapter}
                </span>
              )}
            </div>

            <div style={styles.actions}>
              <select
                value={item.status}
                onChange={(e) =>
                  onUpdate(item.manga_id, e.target.value)
                }
                style={styles.selectDropdown}
              >
                <option value="reading">Reading</option>
                <option value="completed">Completed</option>
                <option value="plan_to_read">Plan</option>
              </select>

              <button 
                onClick={() => onRemove(item.manga_id)}
                style={styles.deleteButton}
              >
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    padding: "32px 24px",
    minHeight: "100vh",
    fontFamily: "'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 800,
    background: "linear-gradient(135deg, #ff6b9d 50%, #ffc9a0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: 0,
    letterSpacing: "-0.5px",
    textShadow: "0 2px 4px rgba(255, 255, 255, 0.5)",
  },
  center: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #ffc9a0 100%)",
    padding: 32,
  },
  loadingBubble: {
    padding: "20px 40px",
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 240, 245, 0.9) 100%)",
    backdropFilter: "blur(12px)",
    borderRadius: 50,
    border: "2px solid rgba(255, 182, 185, 0.5)",
    color: "#ff8ba7",
    fontSize: 16,
    fontWeight: 600,
    boxShadow: "0 8px 32px rgba(255, 182, 185, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
  },
  errorBox: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    borderRadius: 30,
    padding: 40,
    border: "3px solid rgba(255, 182, 185, 0.6)",
    boxShadow: "0 20px 60px rgba(255, 139, 167, 0.4)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
    maxWidth: 400,
  },
  errorText: {
    color: "#ff6b9d",
    fontWeight: 600,
    fontSize: 18,
    textAlign: "center",
  },
  retryButton: {
    padding: "14px 32px",
    borderRadius: 50,
    border: "2px solid rgba(255, 255, 255, 0.8)",
    background: "linear-gradient(135deg, #ff9a9e 0%, #ffc9a0 100%)",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 20px rgba(255, 154, 158, 0.4)",
  },
  section: {
    marginBottom: 24,
    padding: 24,
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 240, 245, 0.85) 100%)",
    backdropFilter: "blur(12px)",
    border: "2px solid rgba(255, 182, 185, 0.4)",
    borderRadius: 24,
    boxShadow: "0 8px 24px rgba(255, 182, 185, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    transition: "all 0.3s ease",
    opacity: 0.95,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#ff6b9d",
    margin: "0 0 20px 0",
    letterSpacing: "-0.3px",
    textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    marginBottom: 12,
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 250, 245, 0.6) 100%)",
    backdropFilter: "blur(12px)",
    border: "1.5px solid rgba(255, 182, 185, 0.3)",
    borderRadius: 20,
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(255, 182, 185, 0.15)",
  },
  itemInfo: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  mangaTitle: {
    color: "#ff6b9d",
    fontSize: 16,
    fontWeight: 700,
  },
  chapter: {
    padding: "4px 14px",
    borderRadius: 50,
    background: "linear-gradient(135deg, rgba(255, 201, 160, 0.6) 0%, rgba(255, 182, 185, 0.6) 100%)",
    border: "1px solid rgba(255, 182, 185, 0.4)",
    color: "#ff6b9d",
    fontSize: 13,
    fontWeight: 600,
    boxShadow: "0 2px 6px rgba(255, 182, 185, 0.2)",
  },
  actions: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  selectDropdown: {
    padding: "10px 20px",
    borderRadius: 50,
    border: "2px solid rgba(255, 182, 185, 0.4)",
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 240, 245, 0.9) 100%)",
    backdropFilter: "blur(12px)",
    color: "#ff8ba7",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    outline: "none",
    boxShadow: "0 4px 12px rgba(255, 182, 185, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
  },
  deleteButton: {
    padding: "10px 18px",
    borderRadius: 50,
    border: "2px solid rgba(255, 255, 255, 0.6)",
    background: "linear-gradient(135deg, #ff9a9e 0%, #ffc9a0 100%)",
    color: "#fff",
    fontSize: 16,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 20px rgba(255, 154, 158, 0.3)",
    fontWeight: 600,
  },
  empty: {
    color: "#ff8ba7",
    fontStyle: "italic",
    fontSize: 15,
    textAlign: "center",
    padding: "32px 20px",
    fontWeight: 500,
  },
};

// Add hover effects for interactive elements
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  select:hover,
  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 154, 158, 0.4) !important;
  }
  
  select:focus {
    border-color: #ff6b9d !important;
    box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.15), 0 4px 12px rgba(255, 182, 185, 0.3) !important;
  }
  
  button:active {
    transform: translateY(0);
  }
`;
document.head.appendChild(styleSheet);