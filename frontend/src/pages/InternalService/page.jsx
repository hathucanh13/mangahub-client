import { useState, useEffect } from "react";
import {
  GetMangaByID,
  UpdateProgress,
  StartGRPCClient,
  SearchManga,
} from "../../../wailsjs/go/services/GRPCService";
import { showToast } from "../../utils/toast";

export default function InternalServicePage() {
  const [mangaId, setMangaId] = useState("");
  const [chapter, setChapter] = useState("");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [mangaResult, setMangaResult] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchPage, setSearchPage] = useState(1);
  const [searchPageSize] = useState(10);

  useEffect(() => {
    // Try to connect to gRPC server on component mount
    handleConnect();

  }, []);

  const handleConnect = async () => {
    try {
      setLoading(true);
      await StartGRPCClient();
      setConnected(true);
      showToast("✅ Connected to gRPC server");
    } catch (error) {
      console.error("Failed to connect to gRPC:", error);
      showToast("❌ Failed to connect to gRPC server");
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGetManga = async () => {
    if (!mangaId.trim()) {
      showToast("⚠️ Please enter a Manga ID");
      return;
    }

    try {
      setLoading(true);
      setMangaResult(null);
      const result = await GetMangaByID(mangaId);
      setMangaResult(result);
      showToast("✅ Manga details fetched successfully");
    } catch (error) {
      console.error("Error fetching manga:", error);
      showToast(`❌ Error: ${error.message || error}`);
      setMangaResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!mangaId.trim() || !chapter.trim()) {
      showToast("⚠️ Please fill all fields");
      return;
    }

    const chapterNum = parseInt(chapter);

    if (isNaN(chapterNum)) {
      showToast("⚠️ Chapter must be a number");
      return;
    }

    try {
      setLoading(true);
      await UpdateProgress( mangaId, chapterNum);
      showToast("✅ Progress updated successfully");
    } catch (error) {
      console.error("Error updating progress:", error);
      showToast(`❌ Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (page = 1) => {
    if (!searchKeyword.trim()) {
      showToast("⚠️ Please enter a search keyword");
      return;
    }

    try {
      setLoading(true);
      setSearchResults(null);
      const result = await SearchManga(searchKeyword, page, searchPageSize);
      setSearchResults(result);
      setSearchPage(page);
      showToast(`✅ Found ${result.total} results`);
    } catch (error) {
      console.error("Error searching manga:", error);
      showToast(`❌ Error: ${error.message || error}`);
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Internal gRPC Service</h1>
          <p style={styles.subtitle}>
            Test and manage gRPC connections and operations
          </p>
        </div>

        {/* Connection Status */}
        <div style={styles.statusCard}>
          <div style={styles.statusHeader}>
            <span style={styles.statusIcon}>{connected ? "🟢" : "🔴"}</span>
            <span style={styles.statusText}>
              {connected ? "Connected to gRPC Server" : "Disconnected"}
            </span>
          </div>
          <button
            onClick={handleConnect}
            disabled={loading}
            style={connected ? styles.btnSecondary : styles.btnPrimary}
          >
            {loading ? "Connecting..." : connected ? "Reconnect" : "Connect"}
          </button>
        </div>

        {/* Get Manga Section */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Get Manga by ID</h2>
          <p style={styles.cardDescription}>
            Fetch manga details using gRPC service
          </p>
          <div style={styles.form}>
            <input
              type="text"
              placeholder="Enter Manga ID (e.g., chainsaw-man)"
              value={mangaId}
              onChange={(e) => setMangaId(e.target.value)}
              style={styles.input}
            />
            <button
              onClick={handleGetManga}
              disabled={loading || !connected}
              style={styles.btnPrimary}
            >
              {loading ? "Fetching..." : "Get Manga"}
            </button>
          </div>

          {/* Display Manga Result */}
          {mangaResult && (
            <div style={styles.resultCard}>
              <div style={styles.resultHeader}>
                <span style={styles.resultIcon}>📖</span>
                <span style={styles.resultTitle}>Manga Details</span>
              </div>
              <div style={styles.resultContent}>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>ID:</span>
                  <span style={styles.resultValue}>{mangaResult.id}</span>
                </div>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>Title:</span>
                  <span style={styles.resultValue}>{mangaResult.title}</span>
                </div>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>Author:</span>
                  <span style={styles.resultValue}>{mangaResult.author}</span>
                </div>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>Description:</span>
                  <span style={styles.resultValue}>
                    {mangaResult.description}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Update Progress Section */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Update Reading Progress</h2>
          <p style={styles.cardDescription}>
            Update chapter progress and broadcast to synced devices
          </p>
          <div style={styles.form}>
            <input
              type="text"
              placeholder="Manga ID (e.g., chainsaw-man)"
              value={mangaId}
              onChange={(e) => setMangaId(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Chapter Number (e.g., 42)"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              style={styles.input}
            />
            <button
              onClick={handleUpdateProgress}
              disabled={loading || !connected}
              style={styles.btnPrimary}
            >
              {loading ? "Updating..." : "Update Progress"}
            </button>
          </div>
        </div>

        {/* Search Manga Section */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Search Manga</h2>
          <p style={styles.cardDescription}>
            Search for manga by keyword using gRPC service
          </p>
          <div style={styles.form}>
            <input
              type="text"
              placeholder="Enter search keyword (e.g., naruto)"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSearch(1);
              }}
              style={styles.input}
            />
            <button
              onClick={() => handleSearch(1)}
              disabled={loading || !connected}
              style={styles.btnPrimary}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Display Search Results */}
          {searchResults && (
            <div style={styles.resultCard}>
              <div style={styles.resultHeader}>
                <span style={styles.resultIcon}>🔍</span>
                <span style={styles.resultTitle}>
                  Search Results ({searchResults.total} found)
                </span>
              </div>
              <div style={styles.searchResultsList}>
                {searchResults.results && searchResults.results.length > 0 ? (
                  searchResults.results.map((manga, index) => (
                    <div key={index} style={styles.searchResultItem}>
                      <div style={styles.searchResultInfo}>
                        <div style={styles.searchResultTitle}>
                          {manga.title}
                        </div>
                        <div style={styles.searchResultMeta}>
                          <span style={styles.searchResultAuthor}>
                            👤 {manga.author}
                          </span>
                          <span style={styles.searchResultId}>
                            🆔 {manga.id}
                          </span>
                        </div>
                        <div style={styles.searchResultDescription}>
                          {manga.description}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={styles.emptyResults}>No results found</div>
                )}
              </div>

              {/* Pagination */}
              {searchResults.total > searchPageSize && (
                <div style={styles.pagination}>
                  <button
                    onClick={() => handleSearch(searchPage - 1)}
                    disabled={searchPage === 1 || loading}
                    style={
                      searchPage === 1
                        ? styles.paginationBtnDisabled
                        : styles.paginationBtn
                    }
                  >
                    ← Previous
                  </button>
                  <span style={styles.pageInfo}>
                    Page {searchPage} of{" "}
                    {Math.ceil(searchResults.total / searchPageSize)}
                  </span>
                  <button
                    onClick={() => handleSearch(searchPage + 1)}
                    disabled={
                      searchPage >=
                        Math.ceil(searchResults.total / searchPageSize) ||
                      loading
                    }
                    style={
                      searchPage >=
                      Math.ceil(searchResults.total / searchPageSize)
                        ? styles.paginationBtnDisabled
                        : styles.paginationBtn
                    }
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "32px 24px",
    display: "flex",
    justifyContent: "center",
    fontFamily:
      "'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
  },

  content: {
    maxWidth: "800px",
    width: "100%",
  },

  header: {
    marginBottom: "32px",
    textAlign: "center",
  },

  title: {
    fontSize: "42px",
    fontWeight: "800",
    margin: "0 0 12px 0",
    background: "linear-gradient(135deg, #fd8d38ff 0%, #ff95b8ff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-0.5px",
    textShadow: "0 2px 4px rgba(255, 255, 255, 0.5)",
  },

  subtitle: {
    fontSize: "16px",
    color: "#ec4b70ff",
    margin: 0,
    fontWeight: "500",
    textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)",
  },

  statusCard: {
    background: "rgba(255, 255, 255, 0.35)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: "20px",
    padding: "24px",
    marginBottom: "24px",
    border: "2px solid rgba(255, 255, 255, 0.5)",
    boxShadow:
      "0 8px 32px rgba(255, 182, 185, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  statusIcon: {
    fontSize: "24px",
    filter: "drop-shadow(0 2px 4px rgba(255, 182, 185, 0.4))",
  },

  statusText: {
    fontSize: "18px",
    fontWeight: "600",
    background: "linear-gradient(135deg, #ff8ba7 0%, #ffc9a0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  card: {
    background: "rgba(255, 255, 255, 0.35)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: "20px",
    padding: "28px",
    marginBottom: "24px",
    border: "2px solid rgba(255, 255, 255, 0.5)",
    boxShadow:
      "0 8px 32px rgba(255, 182, 185, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
  },

  cardTitle: {
    fontSize: "24px",
    fontWeight: "700",
    margin: "0 0 8px 0",
    background: "linear-gradient(135deg, #ff8ba7 0%, #ffc9a0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  cardDescription: {
    fontSize: "14px",
    color: "#ec4b70ff",
    margin: "0 0 20px 0",
    fontWeight: "500",
    textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  input: {
    padding: "14px 18px",
    fontSize: "15px",
    border: "2px solid rgba(255, 182, 185, 0.4)",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(8px)",
    transition: "all 0.2s ease",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    color: "#333",
    boxShadow:
      "0 4px 12px rgba(255, 182, 185, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
  },

  btnPrimary: {
    padding: "14px 24px",
    fontSize: "15px",
    fontWeight: "600",
    border: "2px solid rgba(255, 255, 255, 0.6)",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #ffb6b9 0%, #ffc9a0 100%)",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow:
      "0 6px 20px rgba(255, 139, 167, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  },

  btnSecondary: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    border: "2px solid rgba(255, 182, 185, 0.4)",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(8px)",
    color: "#ff8ba7",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow:
      "0 4px 12px rgba(255, 182, 185, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
  },

  resultCard: {
    marginTop: "20px",
    background: "rgba(255, 245, 250, 0.5)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "20px",
    border: "2px solid rgba(255, 182, 185, 0.3)",
    boxShadow:
      "0 6px 24px rgba(255, 182, 185, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
  },

  resultHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "2px solid rgba(255, 182, 185, 0.2)",
  },

  resultIcon: {
    fontSize: "24px",
    filter: "drop-shadow(0 2px 4px rgba(255, 182, 185, 0.4))",
  },

  resultTitle: {
    fontSize: "18px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #ff8ba7 0%, #ffc9a0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  resultContent: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  resultRow: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  resultLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#ff8ba7",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  resultValue: {
    fontSize: "15px",
    color: "#333",
    fontWeight: "500",
    lineHeight: "1.5",
    padding: "8px 12px",
    background: "rgba(255, 255, 255, 0.6)",
    borderRadius: "10px",
    border: "1px solid rgba(255, 182, 185, 0.2)",
  },

  searchResultsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "500px",
    overflowY: "auto",
  },

  searchResultItem: {
    padding: "16px",
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    borderRadius: "12px",
    border: "2px solid rgba(255, 182, 185, 0.3)",
    boxShadow:
      "0 4px 12px rgba(255, 182, 185, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },

  searchResultInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  searchResultTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#ff6b9d",
    marginBottom: "4px",
  },

  searchResultMeta: {
    display: "flex",
    gap: "16px",
    fontSize: "13px",
  },

  searchResultAuthor: {
    color: "#ff8ba7",
    fontWeight: "600",
  },

  searchResultId: {
    color: "#ffc9a0",
    fontWeight: "600",
  },

  searchResultDescription: {
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.5",
    marginTop: "4px",
  },

  emptyResults: {
    textAlign: "center",
    padding: "32px",
    color: "#ff8ba7",
    fontSize: "15px",
    fontStyle: "italic",
  },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "2px solid rgba(255, 182, 185, 0.2)",
  },

  paginationBtn: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    border: "2px solid rgba(255, 255, 255, 0.6)",
    borderRadius: "50px",
    background: "linear-gradient(135deg, #ffb6b9 0%, #ffc9a0 100%)",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow:
      "0 4px 12px rgba(255, 139, 167, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  },

  paginationBtnDisabled: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    border: "2px solid rgba(255, 182, 185, 0.2)",
    borderRadius: "50px",
    background: "rgba(255, 255, 255, 0.4)",
    color: "#ccc",
    cursor: "not-allowed",
    opacity: 0.5,
  },

  pageInfo: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#ff8ba7",
  },
};
