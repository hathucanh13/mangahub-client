import { useEffect, useState } from "react";
import { List } from "../../../wailsjs/go/services/LibraryService";

export default function LibraryPage() {
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await List();
      setLibrary(data);
    } catch (err) {
      setError(err?.message || "Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.center}>Loading library...</div>;
  }

  if (error) {
    return (
      <div style={styles.center}>
        <div>{error}</div>
        <button onClick={loadLibrary}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>📚 Your Library</h1>

      <Section title="Currently Reading" items={library.reading} showChapter />
      <Section title="Completed" items={library.completed} />
      <Section title="Plan to Read" items={library.plan_to_read} />
    </div>
  );
}

function Section({ title, items, showChapter }) {
  if (!items || items.length === 0) {
    return (
      <div style={styles.section}>
        <h2>{title}</h2>
        <div style={styles.empty}>No items</div>
      </div>
    );
  }

  return (
    <div style={styles.section}>
      <h2>{title}</h2>
      <ul style={styles.list}>
        {items.map((item) => (
          <li key={item.manga_id} style={styles.item}>
            <span>{item.manga_id}</span>
            {showChapter && (
              <span style={styles.chapter}>
                ch {item.current_chapter}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    padding: 24,
    color: "#052b0cff",
    minHeight: "100vh",
  },
  center: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#1e2d04ff",
    gap: 12,
  },
  section: {
    marginTop: 24,
    padding: 16,
    background: "#cc7d39f0",
    border: "1px solid #1e293b",
    borderRadius: 8,
  },
  list: {
    listStyle: "none",
    padding: 0,
    marginTop: 12,
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #1e293b",
  },
  chapter: {
    color: "#040544ff",
  },
  empty: {
    color: "#64748b",
    fontStyle: "italic",
  },
};
