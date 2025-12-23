import MangaCard from "../../components/MangaCard";
import { useEffect, useState } from "react";
import {
  ListMangas,
  SearchMangas,
} from "../../../wailsjs/go/services/MangaService";

export default function HomePage({ onSelectManga, setBackgroundMode }) {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const GENRES = ["shounen", "seinen", "comedy", "romance"];
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    if (error) {
      setBackgroundMode("error");
    } else {
      setBackgroundMode("home");
    }
  }, [error, setBackgroundMode]);

  useEffect(() => {
    setBackgroundMode("home");
    setPage(1);
    loadMangas(1);
  }, [selectedGenres]);

  const [allMangas, setAllMangas] = useState({
    items: [],
    page: 1,
    page_size: 20,
    total_pages: 1,
    total_items: 0,
  });
  const [page, setPage] = useState(1);

  const getCacheKey = (page, genres) => {
    const genresKey = genres.sort().join(",");
    return `manga_cache_${page}_${genresKey}`;
  };

  const getFromCache = (page, genres) => {
    try {
      const key = getCacheKey(page, genres);
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  };

  const saveToCache = (page, genres, data) => {
    try {
      const key = getCacheKey(page, genres);
      localStorage.setItem(
        key,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.warn("Cache save failed:", err);
    }
  };

  const loadMangas = async (page) => {
    // Try cache first
    const cached = getFromCache(page, selectedGenres);
    if (cached) {
      setAllMangas(cached);
      setPage(page);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await ListMangas(page, allMangas.page_size, selectedGenres);
      setAllMangas(data);
      setPage(page);
      saveToCache(page, selectedGenres, data);
    } catch (err) {
      setError(err?.message || "Failed to load manga");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const results = await SearchMangas(searchQuery);
      if (results === undefined || results === null) {
        setError("No manga found for the given search query.");
        setAllMangas({
          items: [],
          page: 1,
          page_size: 0,
          total_pages: 0,
          total_items: 0,
        });
        return;
      }
      setAllMangas({
        items: results,
        page: 1,
        page_size: 50,
        total_pages: 1,
        total_items: results.length,
      });
    } catch (err) {
      setError(err?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };
  const updatePage = (newPage) => {
    loadMangas(newPage);
  };

  const pagedMangas = allMangas.items;

  const totalPages = allMangas.total_pages;

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.loadingBubble}>Loading manga...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <div style={styles.errorBox}>
          <div style={styles.errorText}>{error}</div>
          <button style={styles.errorButton} onClick={() => loadMangas(page)}>
            Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Browse Manga</h2>
        <div style={styles.titleUnderline} />
      </div>

      <div style={styles.controlsWrapper}>
        <div style={styles.glassPanel}>
          <div style={styles.sectionLabel}>Genres</div>
          <div style={styles.filters}>
            {GENRES.map((g) => (
              <button
                key={g}
                style={{
                  ...styles.genreBtn,
                  ...(selectedGenres.includes(g) ? styles.genreBtnActive : {}),
                }}
                onClick={() => {
                  setSelectedGenres((prev) =>
                    prev.includes(g)
                      ? prev.filter((x) => x !== g)
                      : [...prev, g]
                  );
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.glassPanel}>
          <div style={styles.sectionLabel}>Search</div>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              type="text"
              placeholder="Search manga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchButton}>
              Search
            </button>
          </form>
        </div>
      </div>

      <div style={styles.grid}>
        {pagedMangas.map((m) => (
          <MangaCard key={m.id} manga={m} onClick={() => onSelectManga(m.id)} />
        ))}
      </div>

      <div style={styles.pagination}>
        <button
          disabled={page === 1}
          onClick={() => updatePage(page - 1)}
          style={{
            ...styles.paginationBtn,
            ...(page === 1 ? styles.paginationBtnDisabled : {}),
          }}
        >
          ← Prev
        </button>
        <div style={styles.pageIndicator}>
          Page {page} of {totalPages}
        </div>
        <button
          disabled={page === totalPages}
          onClick={() => updatePage(page + 1)}
          style={{
            ...styles.paginationBtn,
            ...(page === totalPages ? styles.paginationBtnDisabled : {}),
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    minHeight: "100%",
    gap: 24,
    fontFamily:
      "'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
  },

  header: {
    textAlign: "center",
    marginBottom: 8,
  },

  title: {
    fontSize: 36,
    fontWeight: 800,
    background: "linear-gradient(135deg, #fd8d38ff 80%, #ff95b8ff 50%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: 0,
    letterSpacing: "-0.5px",
    textShadow: "0 2px 4px rgba(255, 255, 255, 0.5)",
  },

  titleUnderline: {
    width: 120,
    height: 4,
    background: "linear-gradient(90deg, #ffb6b9, #ffc9a0)",
    borderRadius: 2,
    margin: "12px auto 0",
    boxShadow: "0 2px 8px rgba(255, 182, 185, 0.4)",
  },

  controlsWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  glassPanel: {
    background: "rgba(255, 255, 255, 0.35)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "2px solid rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
    padding: 20,
    boxShadow:
      "0 8px 32px rgba(255, 182, 185, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: "#ec4b70ff",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: 12,
    textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)",
  },

  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },

  genreBtn: {
    padding: "10px 20px",
    borderRadius: 50,
    border: "2px solid rgba(255, 182, 185, 0.4)",
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 240, 245, 0.9) 100%)",
    color: "#ff8ba7",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.3s ease",
    boxShadow:
      "0 4px 12px rgba(255, 182, 185, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    textTransform: "capitalize",
  },

  genreBtnActive: {
    background: "linear-gradient(135deg, #ffb6b9 0%, #ffc9a0 100%)",
    color: "#ffffff",
    border: "2px solid rgba(255, 255, 255, 0.6)",
    boxShadow:
      "0 6px 20px rgba(255, 139, 167, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    transform: "translateY(-2px)",
  },

  searchForm: {
    display: "flex",
    gap: 10,
  },

  searchInput: {
    flex: 1,
    padding: "12px 18px",
    borderRadius: 50,
    border: "2px solid rgba(255, 201, 160, 0.4)",
    background: "rgba(255, 255, 255, 0.8)",
    color: "#ff8ba7",
    fontSize: 15,
    outline: "none",
    transition: "all 0.3s ease",
    boxShadow: "inset 0 2px 6px rgba(255, 182, 185, 0.1)",
  },

  searchButton: {
    padding: "12px 28px",
    borderRadius: 50,
    border: "2px solid rgba(255, 255, 255, 0.6)",
    background: "linear-gradient(135deg, #ffc9a0 0%, #ffb6b9 100%)",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow:
      "0 6px 20px rgba(255, 201, 160, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 20,
  },

  center: {
    height: "100%",
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
    color: "#e22b56ff",
    fontSize: 16,
    fontWeight: 500,
    boxShadow:
      "0 8px 32px rgba(255, 182, 185, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
  },

  error: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // background:
    //   "linear-gradient(135deg, rgba(255, 154, 158, 0.95) 0%, rgba(250, 208, 196, 0.95) 100%)",
    // backdropFilter: "blur(10px)",
  },

  errorBox: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    borderRadius: 30,
    padding: 40,
    border: "3px solid rgba(255, 182, 185, 0.6)",
    boxShadow:
      "0 20px 60px rgba(255, 139, 167, 0.4), inset 0 1px 0 rgba(255, 255, 255, 1)",
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
    textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)",
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
    transition: "all 0.3s ease",
    boxShadow:
      "0 6px 20px rgba(255, 154, 158, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
  },

  pagination: {
    marginTop: 24,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    padding: 20,
    background: "rgba(255, 255, 255, 0.3)",
    backdropFilter: "blur(12px)",
    borderRadius: 50,
    border: "2px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 8px 32px rgba(255, 182, 185, 0.2)",
  },

  paginationBtn: {
    padding: "12px 24px",
    borderRadius: 50,
    border: "2px solid rgba(255, 255, 255, 0.6)",
    background: "linear-gradient(135deg, #ffc9a0 0%, #ffb6b9 100%)",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow:
      "0 6px 20px rgba(255, 201, 160, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
  },

  paginationBtnDisabled: {
    background: "rgba(255, 255, 255, 0.4)",
    color: "rgba(255, 139, 167, 0.5)",
    cursor: "not-allowed",
    border: "2px solid rgba(255, 182, 185, 0.3)",
    boxShadow: "none",
  },

  pageIndicator: {
    padding: "8px 20px",
    borderRadius: 50,
    background: "rgba(255, 255, 255, 0.7)",
    color: "#ff8ba7",
    fontSize: 14,
    fontWeight: 600,
    border: "2px solid rgba(255, 182, 185, 0.3)",
    boxShadow: "inset 0 2px 6px rgba(255, 182, 185, 0.15)",
  },
};
