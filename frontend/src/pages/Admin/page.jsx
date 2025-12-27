import { useState } from "react";
import {
  UpdateManga,
  UpdateMangaChapter,
} from "../../../wailsjs/go/services/AdminService";
import { showToast } from "../../utils/toast";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);

  // Update Manga Form State
  const [mangaId, setMangaId] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [artist, setArtist] = useState("");
  const [genres, setGenres] = useState("");
  const [chapters, setChapters] = useState("");
  const [volumes, setVolumes] = useState("");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState("");
  const [popularity, setPopularity] = useState("");
  const [ranking, setRanking] = useState("");

  // Update Chapter Form State
  const [chapterMangaId, setChapterMangaId] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");

  const handleUpdateManga = async () => {
    if (!mangaId.trim()) {
      showToast("⚠️ Manga ID is required");
      return;
    }

    try {
      setLoading(true);

      const genresArray = genres ? genres.split(",").map((g) => g.trim()) : [];
      const chaptersNum = chapters ? parseInt(chapters) : 0;
      const volumesNum = volumes ? parseInt(volumes) : 0;
      const yearNum = year ? parseInt(year) : 0;
      const popularityNum = popularity ? parseInt(popularity) : 0;
      const rankingNum = ranking ? parseInt(ranking) : 0;

      await UpdateManga(
        mangaId,
        title,
        author,
        artist,
        status,
        genresArray,
        chaptersNum,
        volumesNum,
        yearNum,
        popularityNum,
        rankingNum
      );

      showToast("✅ Manga updated successfully!");

      // Clear form
      setMangaId("");
      setTitle("");
      setAuthor("");
      setArtist("");
      setGenres("");
      setChapters("");
      setVolumes("");
      setYear("");
      setStatus("");
      setPopularity("");
      setRanking("");
    } catch (error) {
      console.error("Error updating manga:", error);
      showToast(`❌ Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChapter = async () => {
    if (!chapterMangaId.trim() || !chapterNumber.trim()) {
      showToast("⚠️ Please fill all fields");
      return;
    }

    const chapterNum = parseInt(chapterNumber);
    if (isNaN(chapterNum) || chapterNum <= 0) {
      showToast("⚠️ Chapter must be a positive number");
      return;
    }

    try {
      setLoading(true);
      await UpdateMangaChapter(chapterMangaId, chapterNum);
      showToast("✅ Chapter release updated successfully!");

      // Clear form
      setChapterMangaId("");
      setChapterNumber("");
    } catch (error) {
      console.error("Error updating chapter:", error);
      showToast(`❌ Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Panel</h1>
          <p style={styles.subtitle}>Manage manga database and releases</p>
        </div>

        {/* Update Manga Section */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Update Manga</h2>
          <p style={styles.cardDescription}>
            Update manga details in the database
          </p>
          <div style={styles.form}>
            <input
              type="text"
              placeholder="Manga ID (required)"
              value={mangaId}
              onChange={(e) => setMangaId(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Genres (comma-separated)"
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              style={styles.input}
            />
            <div style={styles.row}>
              <input
                type="text"
                placeholder="Chapters"
                value={chapters}
                onChange={(e) => setChapters(e.target.value)}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Volumes"
                value={volumes}
                onChange={(e) => setVolumes(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.row}>
              <input
                type="text"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.row}>
              <input
                type="text"
                placeholder="Popularity"
                value={popularity}
                onChange={(e) => setPopularity(e.target.value)}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Ranking"
                value={ranking}
                onChange={(e) => setRanking(e.target.value)}
                style={styles.input}
              />
            </div>
            <button
              onClick={handleUpdateManga}
              disabled={loading}
              style={styles.btnPrimary}
            >
              {loading ? "Updating..." : "Update Manga"}
            </button>
          </div>
        </div>

        {/* Update Chapter Release Section */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Update Chapter Release</h2>
          <p style={styles.cardDescription}>
            Update the latest chapter release for a manga
          </p>
          <div style={styles.form}>
            <input
              type="text"
              placeholder="Manga ID"
              value={chapterMangaId}
              onChange={(e) => setChapterMangaId(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Chapter Number"
              value={chapterNumber}
              onChange={(e) => setChapterNumber(e.target.value)}
              style={styles.input}
            />
            <button
              onClick={handleUpdateChapter}
              disabled={loading}
              style={styles.btnPrimary}
            >
              {loading ? "Updating..." : "Update Chapter"}
            </button>
          </div>
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

  row: {
    display: "flex",
    gap: "12px",
  },

  input: {
    flex: 1,
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
};
