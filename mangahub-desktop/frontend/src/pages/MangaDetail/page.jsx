import { useEffect, useState } from "react";
import { ListMangaDetail } from "../../../wailsjs/go/services/MangaService";
import { Subscribe } from "../../../wailsjs/go/services/NotifyService";
import { GetCurrentUsername } from "../../../wailsjs/go/services/AuthService";

export default function MangaDetailPage({
  mangaId,
  onBack,
  setBackgroundMode,
  onJoinChat,
}) {
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  useEffect(() => {
    if (error) {
      setBackgroundMode("error");
    } else {
      setBackgroundMode("home");
    }
  }, [error, setBackgroundMode]);

  // Load subscription state from cache
  useEffect(() => {
    const loadSubscriptionState = async () => {
      if (mangaId) {
        try {
          const username = await GetCurrentUsername();
          const cached = localStorage.getItem(`manga_sub_${username}_${mangaId}`);
          if (cached === "true") {
            setSubscribed(true);
          } else {
            setSubscribed(false);
          }
        } catch (err) {
          console.error("Failed to load subscription state:", err);
          setSubscribed(false);
        }
      }
    };
    
    loadSubscriptionState();
  }, [mangaId]);

  const getFromCache = (id) => {
    try {
      const cached = localStorage.getItem(`manga_detail_${id}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > CACHE_DURATION) {
        localStorage.removeItem(`manga_detail_${id}`);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  };

  const saveToCache = (id, data) => {
    try {
      localStorage.setItem(
        `manga_detail_${id}`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.warn("Cache save failed:", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      // Try cache first
      const cached = getFromCache(mangaId);
      if (cached) {
        setManga(cached);
        setLoading(false);
        return;
      }

      try {
        const data = await ListMangaDetail(mangaId);
        setManga(data);
        saveToCache(mangaId, data);
      } catch (err) {
        setError("Failed to load manga detail");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [mangaId]);

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.loadingBubble}>Loading manga...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <div style={styles.errorBox}>
          <div style={styles.errorText}>{error}</div>
          <button style={styles.errorButton} onClick={onBack}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!manga) return null;

  const handleSubscribe = async () => {
    if (subscribing || subscribed) return;

    setSubscribing(true);
    try {
      // Get current username
      const username = await GetCurrentUsername();
      
      await Subscribe(manga.id);
      setSubscribed(true);
      
      // Cache subscription status with username to prevent cross-user issues
      localStorage.setItem(`manga_sub_${username}_${manga.id}`, "true");
      
      alert(
        `✅ Subscribed to ${manga.title}!\nYou'll receive notifications for new chapters.`
      );
    } catch (err) {
      console.error("Failed to subscribe:", err);
      alert("Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.imageSection}>
          <button onClick={onBack} style={styles.backButton}>
            ← Back
          </button>
          <div style={styles.imageWrapper}>
            <img
              src={manga.cover_url}
              alt={manga.title}
              style={styles.coverImage}
            />
            <div style={styles.imageOverlay} />
          </div>
        </div>

        <div style={styles.infoPanel}>
          <h1 style={styles.title}>{manga.title}</h1>

          <div style={styles.metadata}>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Author:</span>
              <span style={styles.metaValue}>{manga.author}</span>
            </div>

            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Artist:</span>
              <span style={styles.metaValue}>{manga.artist}</span>
            </div>

            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Status:</span>
              <span style={styles.statusBadge}>{manga.status}</span>
            </div>

            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Year:</span>
              <span style={styles.metaValue}>{manga.published_year}</span>
            </div>

            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Chapters:</span>
              <span style={styles.metaValue}>{manga.chapter_count || 'N/A'}</span>
            </div>

            {manga.popularity && (
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Popularity:</span>
                <span style={styles.metaValue}>#{manga.popularity}</span>
              </div>
            )}

            {manga.ranking && (
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Ranking:</span>
                <span style={styles.metaValue}>#{manga.ranking}</span>
              </div>
            )}
          </div>

          <div style={styles.genresWrapper}>
            {manga.genres.map((g) => (
              <span key={g} style={styles.genre}>
                {g}
              </span>
            ))}
          </div>
          <div style={styles.actionButtons}>
            <button
              onClick={handleSubscribe}
              style={{
                ...styles.subscribeButton,
                ...(subscribed ? styles.subscribedButton : {}),
                ...(subscribing ? styles.subscribingButton : {}),
              }}
              disabled={subscribing || subscribed}
            >
              {subscribed
                ? "✓ Subscribed"
                : subscribing
                ? "Subscribing..."
                : "🔔 Subscribe to Updates"}
            </button>
          </div>

          <div style={styles.descriptionBox}>
            <h3 style={styles.descriptionTitle}>Description</h3>
            <p style={styles.description}>{manga.description}</p>
          </div>

          {onJoinChat && (
            <button
              onClick={() => onJoinChat(manga.id, manga.title)}
              style={styles.joinChatButton}
            >
              💬 Join Discussion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "32px 24px",
    minHeight: "100%",
  },

  backButton: {
    padding: "12px 24px",
    borderRadius: 50,
    border: "2px solid rgba(255, 255, 255, 0.6)",
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 240, 245, 0.9) 100%)",
    backdropFilter: "blur(12px)",
    color: "#ff8ba7",
    fontSize: 15,
    fontWeight: 600,
    alignSelf: "flex-start",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow:
      "0 6px 20px rgba(255, 182, 185, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    marginBottom: 24,
  },
  imageSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },

  content: {
    display: "flex",
    gap: 32,
    flexWrap: "wrap",
  },

  imageWrapper: {
    position: "relative",
    flexShrink: 0,
    borderRadius: 24,
    alignSelf: "flex-start",

    overflow: "hidden",
    boxShadow: "0 12px 40px rgba(255, 182, 185, 0.3)",
    border: "3px solid rgba(255, 255, 255, 0.8)",
  },

  coverImage: {
    width: 280,
    height: 400,
    objectFit: "cover",
    display: "block",
  },

  imageOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(255, 154, 158, 0) 0%, rgba(255, 182, 185, 0.2) 100%)",
    pointerEvents: "none",
  },

  infoPanel: {
    flex: 1,
    minWidth: 300,
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  title: {
    margin: 0,
    fontSize: 36,
    fontWeight: 800,
    fontFamily:
      "'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",

    background:
      "linear-gradient(135deg, #fc6368ff 30%,  #fc9f43ff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    lineHeight: 1.2,
    letterSpacing: "-0.5px",
  },

  metadata: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 20,
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 240, 245, 0.85) 100%)",
    backdropFilter: "blur(12px)",
    borderRadius: 20,
    border: "2px solid rgba(255, 182, 185, 0.4)",
    boxShadow:
      "0 8px 24px rgba(255, 182, 185, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
  },

  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  metaLabel: {
    fontWeight: 700,
    color: "#ff6b9d",
    fontSize: 14,
    minWidth: 80,
  },

  metaValue: {
    color: "#ff8ba7",
    fontSize: 15,
    fontWeight: 500,
  },

  statusBadge: {
    padding: "6px 16px",
    borderRadius: 50,
    background:
      "linear-gradient(135deg, rgba(255, 201, 160, 0.8) 0%, rgba(255, 182, 185, 0.8) 100%)",
    border: "1px solid rgba(255, 182, 185, 0.5)",
    color: "#ff6b9d",
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    boxShadow: "0 2px 8px rgba(255, 182, 185, 0.2)",
  },

  genresWrapper: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  genre: {
    padding: "8px 18px",
    borderRadius: 50,
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 240, 245, 0.9) 100%)",
    border: "2px solid rgba(255, 182, 185, 0.4)",
    color: "#ff8ba7",
    fontSize: 13,
    fontWeight: 600,
    textTransform: "capitalize",
    boxShadow: "0 4px 12px rgba(255, 182, 185, 0.2)",
  },

  descriptionBox: {
    padding: 24,
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 240, 245, 0.85) 100%)",
    backdropFilter: "blur(12px)",
    borderRadius: 20,
    border: "2px solid rgba(255, 182, 185, 0.4)",
    boxShadow:
      "0 8px 24px rgba(255, 182, 185, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
  },

  descriptionTitle: {
    margin: "0 0 16px 0",
    fontSize: 20,
    fontWeight: 700,
    color: "#ff6b9d",
    textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)",
  },

  description: {
    margin: 0,
    color: "#ff8ba7",
    fontSize: 15,
    lineHeight: 1.7,
    fontWeight: 500,
  },

  center: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
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
    maxWidth: 400,
  },

  errorText: {
    color: "#ff6b9d",
    fontWeight: 600,
    fontSize: 18,
    textAlign: "center",
  },

  errorButton: {
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

  actionButtons: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 8,
  },

  joinChatButton: {
    padding: "16px 32px",
    borderRadius: 50,
    border: "2px solid rgba(255, 255, 255, 0.8)",
    background: "linear-gradient(135deg, #ff9a9e 0%, #ffc9a0 100%)",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow:
      "0 8px 24px rgba(255, 154, 158, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
    textAlign: "center",
  },

  subscribeButton: {
    padding: "10px 20px",
    borderRadius: 50,
    border: "2px solid rgba(255, 255, 255, 0.8)",
    background: "linear-gradient(135deg, #ffc9a0 0%, #ffafbd 100%)",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow:
      "0 8px 24px rgba(255, 175, 189, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
    textAlign: "center",
  },

  subscribedButton: {
    background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
    boxShadow:
      "0 8px 24px rgba(74, 222, 128, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
    cursor: "default",
  },

  subscribingButton: {
    opacity: 0.6,
    cursor: "wait",
  },
};
