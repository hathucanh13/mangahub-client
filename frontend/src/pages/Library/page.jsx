import {
  List,
  Add,
  Update,
  Remove,
  UpdateProgress,
  GetProgressHistory,
} from "../../../wailsjs/go/services/LibraryService";
import { useEffect, useState } from "react";
import { showToast } from "../../utils/toast";

export default function LibraryPage({
  syncBroadcasts = [],
  onBroadcastProcessed,
}) {
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasPendingSync, setHasPendingSync] = useState(false);
  const [progressHistory, setProgressHistory] = useState({});

  useEffect(() => {
    loadLibrary();
    loadProgressHistory();
  }, []);

  // Process sync broadcasts from parent
  useEffect(() => {
    if (syncBroadcasts.length > 0) {
      syncBroadcasts.forEach((broadcast) => {
        handleSyncBroadcast(broadcast);
      });
      // Clear processed broadcasts
      if (onBroadcastProcessed) {
        onBroadcastProcessed();
      }
    }
  }, [syncBroadcasts]);

  useEffect(() => {
    setProgressHistory((prev) => {
      const merged = { ...prev };

      return merged;
    });
  }, [syncBroadcasts]);

  const handleSyncBroadcast = (broadcast) => {
    console.log("Processing sync broadcast in Library:", broadcast);

    // Update progress history with the new timestamp
    setProgressHistory((prev) => ({
      ...prev,
      [broadcast.manga_id]: {
        chapter: broadcast.current_chapter,
        date: broadcast.updated_at,
      },
    }));

    // Update library item if it exists
    setLibrary((prev) => {
      if (!prev) return prev;

      const updateSection = (items) => {
        if (!items) return items;
        return items.map((item) =>
          item.manga_id === broadcast.manga_id
            ? { ...item, current_chapter: broadcast.current_chapter }
            : item
        );
      };

      return {
        reading: updateSection(prev.reading),
        completed: updateSection(prev.completed),
        plan_to_read: updateSection(prev.plan_to_read),
      };
    });
  };

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

  const loadProgressHistory = async () => {
    try {
      const history = await GetProgressHistory("");
      // Convert history array to map for quick lookup
      const historyMap = {};
      if (history && history.history) {
        history.history.forEach((item) => {
          historyMap[item.manga_id] = {
            chapter: item.chapter,
            date: item.date_read,
          };
        });
      }

      // Set initial progress history from API
      setProgressHistory(historyMap);
    } catch (err) {
      console.error("Failed to load progress history:", err);
    }
  };

  const addManga = async (mangaId) => {
    try {
      await Add(mangaId, "plan_to_read", null);
      await loadLibrary();
    } catch (err) {
      showToast(`❌ ${err?.message || "Add failed"}`);
    }
  };

  const updateStatus = async (mangaId, status) => {
    try {
      await Update(mangaId, status);
      await loadLibrary();
      showToast(`✅ Status updated`);
    } catch (err) {
      showToast(`❌ ${err?.message || "Update failed"}`);
    }
  };

  const updateProgress = async (mangaId, chapter, volume, notes, force) => {
    try {
      const result = await UpdateProgress(
        mangaId,
        chapter,
        volume,
        notes,
        force
      );
      await loadLibrary();
      await loadProgressHistory();
      await handleSyncProgress();

      showToast(
        `✅ ${result.manga_title}: Chapter ${result.previous_chapter} → ${result.current_chapter}`
      );
    } catch (err) {
      showToast(`❌ ${err?.message || "Progress update failed"}`);
    }
  };

  const removeManga = async (mangaId) => {
    if (!confirm("Remove this manga from library?")) return;
    try {
      await Remove(mangaId);
      await loadLibrary();
      showToast("✅ Removed from library");
    } catch (err) {
      showToast(`❌ ${err?.message || "Remove failed"}`);
    }
  };

  const handleSyncProgress = async () => {
    try {
      setHasPendingSync(false);
      await loadLibrary();
      await loadProgressHistory();
    } catch (err) {
      showToast(`❌ Sync failed: ${err.message}`);
    }
  };

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
        <h1 style={styles.title}>
          <span style={styles.titleIcon}>📚</span>
          Your Library
        </h1>
        <div style={styles.titleUnderline} />

        {/* Sync Notification Button */}
        {hasPendingSync && (
          <button style={styles.syncNotification} onClick={handleSyncProgress}>
            <span style={styles.syncIcon}>🔄</span>
            <span>Sync Reading Progress</span>
            <span style={styles.syncBadge}>New</span>
          </button>
        )}
      </div>

      <Section
        title="Currently Reading"
        items={library?.reading}
        showChapter
        showProgress
        progressHistory={progressHistory}
        onUpdate={updateStatus}
        onRemove={removeManga}
        onUpdateProgress={updateProgress}
      />

      <Section
        title="Completed"
        items={library?.completed}
        progressHistory={progressHistory}
        onUpdate={updateStatus}
        onRemove={removeManga}
      />

      <Section
        title="Plan to Read"
        items={library?.plan_to_read}
        progressHistory={progressHistory}
        onUpdate={updateStatus}
        onRemove={removeManga}
      />
    </div>
  );
}

function Section({
  title,
  items,
  showChapter,
  showProgress,
  progressHistory,
  onUpdate,
  onRemove,
  onUpdateProgress,
}) {
  const [editingManga, setEditingManga] = useState(null);
  const [newChapter, setNewChapter] = useState("");

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      // const diffMins = Math.floor(diffMs / 60000);
      // const diffHours = Math.floor(diffMs / 3600000);
      // const diffDays = Math.floor(diffMs / 86400000);

      // if (diffMins < 1) return "just now";
      // if (diffMins < 60) return `${diffMins}m ago`;
      // if (diffHours < 24) return `${diffHours}h ago`;
      // if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString();
    } catch {
      return "";
    }
  };

  if (!items || items.length === 0) {
    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <div style={styles.empty}>No items yet</div>
      </div>
    );
  }

  const handleUpdateProgress = (mangaId) => {
    const chapter = parseInt(newChapter);
    if (isNaN(chapter) || chapter <= 0) {
      showToast("❌ Please enter a valid chapter number");
      return;
    }

    onUpdateProgress(mangaId, chapter, null, null, false);
    setEditingManga(null);
    setNewChapter("");
    handleSyncProgress();
  };

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <ul style={styles.list}>
        {items.map((item) => {
          const historyItem = progressHistory[item.manga_id];

          return (
            <li key={item.manga_id} style={styles.item}>
              <div style={styles.itemInfo}>
                <div style={styles.mangaInfo}>
                  <strong style={styles.mangaTitle}>{item.manga_id}</strong>
                  {showChapter && (
                    <div style={styles.chapterInfo}>
                      <span style={styles.chapter}>
                        Chapter {item.current_chapter || 0}
                      </span>
                      {historyItem && (
                        <span style={styles.timestamp}>
                          • {formatDate(historyItem.date)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.actions}>
                {showProgress && editingManga === item.manga_id ? (
                  <div style={styles.progressEdit}>
                    <input
                      type="number"
                      placeholder="Ch #"
                      value={newChapter}
                      onChange={(e) => setNewChapter(e.target.value)}
                      style={styles.chapterInput}
                      min="1"
                    />
                    <button
                      onClick={() => handleUpdateProgress(item.manga_id)}
                      style={styles.saveBtn}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setEditingManga(null);
                        setNewChapter("");
                      }}
                      style={styles.cancelBtn}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    {showProgress && (
                      <button
                        onClick={() => {
                          setEditingManga(item.manga_id);
                          setNewChapter(
                            String((item.current_chapter || 0) + 1)
                          );
                        }}
                        style={styles.progressBtn}
                        title="Update progress"
                      >
                        📖
                      </button>
                    )}

                    <select
                      value={item.status}
                      onChange={(e) => onUpdate(item.manga_id, e.target.value)}
                      style={styles.select}
                    >
                      <option value="reading">Reading</option>
                      <option value="completed">Completed</option>
                      <option value="plan_to_read">Plan</option>
                    </select>

                    <button
                      onClick={() => onRemove(item.manga_id)}
                      style={styles.deleteBtn}
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    padding: "32px 24px",
    minHeight: "100vh",
  },

  header: {
    textAlign: "center",
    marginBottom: 32,
  },

  title: {
    margin: 0,
    fontSize: 42,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    fontFamily:
      "'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
    background: "linear-gradient(135deg, #ff6b9d 50%, #ffc9a0 100%)",
    textShadow: "0 2px 4px rgba(255, 255, 255, 0.5)",

    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-0.5px",
  },

  titleIcon: {
    fontSize: 48,
    filter: "drop-shadow(0 2px 12px rgba(255, 182, 185, 0.4))",
  },

  titleUnderline: {
    width: 120,
    height: 4,
    background: "linear-gradient(90deg, #ffb6b9, #ffc9a0)",
    borderRadius: 2,
    margin: "12px auto 0",
    boxShadow: "0 2px 8px rgba(255, 182, 185, 0.4)",
  },

  syncNotification: {
    marginTop: 24,
    padding: "16px 32px",
    borderRadius: 50,
    border: "2px solid rgba(158, 230, 147, 0.5)",
    background: "linear-gradient(135deg, #9ee693 0%, #a0e4cb 100%)",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    boxShadow:
      "0 8px 24px rgba(158, 230, 147, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    transition: "all 0.3s ease",
    animation: "pulse 2s ease-in-out infinite",
  },

  syncIcon: {
    fontSize: 20,
    animation: "spin 2s linear infinite",
  },

  syncBadge: {
    padding: "4px 12px",
    borderRadius: 50,
    background: "rgba(255, 107, 157, 0.9)",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  center: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingBubble: {
    padding: "20px 40px",
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 240, 245, 0.9) 100%)",
    backdropFilter: "blur(12px)",
    borderRadius: 50,
    border: "2px solid rgba(255, 182, 185, 0.5)",
    color: "#ff8ba7",
    fontSize: 16,
    fontWeight: 500,
    boxShadow:
      "0 8px 32px rgba(255, 182, 185, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
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
  },

  errorText: {
    color: "#ff6b9d",
    fontWeight: 600,
    fontSize: 18,
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
    boxShadow: "0 6px 20px rgba(255, 154, 158, 0.4)",
  },

  section: {
    marginTop: 24,
    padding: 24,
    background: "rgba(255, 255, 255, 0.35)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "2px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
    boxShadow:
      "0 8px 32px rgba(255, 182, 185, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
  },

  sectionTitle: {
    margin: "0 0 20px 0",
    fontSize: 24,
    fontWeight: 700,
    color: "#ff6b9d",
    textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)",
  },

  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    background: "rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    borderRadius: 16,
    border: "2px solid rgba(255, 182, 185, 0.3)",
    boxShadow: "0 4px 12px rgba(255, 182, 185, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
  },

  itemInfo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  mangaInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  mangaTitle: {
    color: "#ff6b9d",
    fontSize: 15,
    fontWeight: 600,
  },

  chapterInfo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  chapter: {
    color: "#ff6b9d",
    fontSize: 13,
    fontWeight: 600,
    padding: "4px 12px",
    background: "rgba(255, 201, 160, 0.3)",
    borderRadius: 50,
    border: "1px solid rgba(255, 182, 185, 0.3)",
  },

  timestamp: {
    color: "#ff8ba7",
    fontSize: 12,
    fontWeight: 500,
    opacity: 0.8,
  },

  empty: {
    color: "#ff8ba7",
    fontStyle: "italic",
    textAlign: "center",
    padding: "32px 20px",
    fontSize: 15,
    opacity: 0.7,
  },

  actions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  progressEdit: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  chapterInput: {
    width: 80,
    padding: "8px 12px",
    borderRadius: 50,
    border: "2px solid rgba(255, 182, 185, 0.4)",
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    color: "#ff6b9d",
    fontSize: 14,
    fontWeight: 600,
    outline: "none",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(255, 182, 185, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
  },

  progressBtn: {
    padding: "8px 14px",
    borderRadius: 50,
    border: "2px solid rgba(255, 255, 255, 0.6)",
    background: "linear-gradient(135deg, #ffb6b9 0%, #ffc9a0 100%)",
    color: "white",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(255, 139, 167, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  },

  saveBtn: {
    padding: "8px 14px",
    borderRadius: 50,
    border: "2px solid rgba(255, 255, 255, 0.6)",
    background: "linear-gradient(135deg, #9ee693 0%, #a0e4cb 100%)",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(158, 230, 147, 0.4)",
  },

  cancelBtn: {
    padding: "8px 14px",
    borderRadius: 50,
    border: "2px solid rgba(255, 182, 185, 0.4)",
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    color: "#ff8ba7",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(255, 182, 185, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
  },

  select: {
    padding: "8px 16px",
    borderRadius: 50,
    border: "2px solid rgba(255, 182, 185, 0.4)",
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    color: "#ff8ba7",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    outline: "none",
    boxShadow: "0 2px 8px rgba(255, 182, 185, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
  },

  deleteBtn: {
    padding: "8px 12px",
    borderRadius: 50,
    border: "2px solid rgba(255, 255, 255, 0.6)",
    background: "linear-gradient(135deg, #ffb6b9 0%, #ff9a9e 100%)",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(255, 139, 167, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  },
};

// Add animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 8px 24px rgba(158, 230, 147, 0.4);
    }
    50% {
      box-shadow: 0 8px 32px rgba(158, 230, 147, 0.6);
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
if (!document.getElementById("library-animations")) {
  styleSheet.id = "library-animations";
  document.head.appendChild(styleSheet);
}
