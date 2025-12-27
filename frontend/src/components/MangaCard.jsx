import { Add } from "../../wailsjs/go/services/LibraryService";
import { showToast } from "../utils/toast";

export default function MangaCard({ manga, onClick }) {
  const addToLibrary = async (e) => {
    e.stopPropagation(); // Prevent card click when clicking button
    try {
      console.log("Adding manga:", manga);
      await Add(manga.id);
      showToast(`✅ Added ${manga.title} to your library`);
    } catch (e) {
      showToast(`❌ Failed to add ${manga.id} to library: ${e.message}`);
    }
  };

  return (
    <div onClick={onClick} style={styles.card}>
      <div style={styles.imageWrapper}>
        <img src={manga.cover_url} alt={manga.title} style={styles.img} />
        <div style={styles.imageOverlay} />
      </div>
      
      <div style={styles.content}>
        <h4 style={styles.title}>{manga.title}</h4>
        <p style={styles.author}>{manga.author}</p>
        
        <div style={styles.statusBadge}>
          <span style={styles.statusText}>{manga.status}</span>
        </div>
        
        <button onClick={addToLibrary} style={styles.btn}>
          <span style={styles.btnIcon}>➕</span>
          <span style={styles.btnText}>Add to Library</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 240, 245, 0.8) 100%)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    padding: 14,
    borderRadius: 24,
    textAlign: "center",
    border: "2px solid rgba(255, 182, 185, 0.4)",
    boxShadow: "0 8px 24px rgba(255, 182, 185, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    overflow: "hidden",
  },

  imageWrapper: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    boxShadow: "0 4px 16px rgba(255, 139, 167, 0.2)",
  },

  img: {
    width: "100%",
    height: 240,
    objectFit: "cover",
    display: "block",
    transition: "transform 0.3s ease",
  },

  imageOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(255, 154, 158, 0) 0%, rgba(255, 182, 185, 0.15) 100%)",
    pointerEvents: "none",
  },

  content: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "#ff6b9d",
    lineHeight: 1.3,
    textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },

  author: {
    margin: 0,
    fontSize: 13,
    color: "#ff8ba7",
    fontWeight: 500,
    opacity: 0.9,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  statusBadge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 50,
    background: "linear-gradient(135deg, rgba(255, 201, 160, 0.6) 0%, rgba(255, 182, 185, 0.6) 100%)",
    border: "1px solid rgba(255, 182, 185, 0.5)",
    margin: "4px auto",
    boxShadow: "0 2px 8px rgba(255, 182, 185, 0.2)",
  },

  statusText: {
    fontSize: 11,
    fontWeight: 700,
    color: "#ff6b9d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    textShadow: "0 1px 1px rgba(255, 255, 255, 0.8)",
  },

  btn: {
    marginTop: 8,
    width: "100%",
    padding: "10px 16px",
    cursor: "pointer",
    background: "linear-gradient(135deg, #ffc9a0 0%, #ffb6b9 100%)",
    border: "2px solid rgba(255, 255, 255, 0.6)",
    borderRadius: 50,
    fontSize: 13,
    fontWeight: 700,
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(255, 201, 160, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    textShadow: "0 1px 2px rgba(255, 107, 157, 0.3)",
  },

  btnIcon: {
    fontSize: 14,
  },

  btnText: {
    letterSpacing: "0.3px",
  },
};