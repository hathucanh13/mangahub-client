import { Add } from "../../wailsjs/go/services/LibraryService";
import { showToast } from "../utils/toast";

export default function MangaCard({ manga }) {
  const addToLibrary = async () => {
    try {
    console.log("Adding manga:", manga);
      await Add(manga.id);
      showToast(`✅ Added ${manga.title} to your library`);
    } catch (e) {
      showToast(`❌ Failed to add ${manga.id} to library: ${e.message}`);
    }
  };

  return (
    <div style={styles.card}>
      <img src={manga.cover} alt={manga.title} style={styles.img} />
      <h4>{manga.title}</h4>
      <h6>{manga.id}</h6>
      <p>{manga.author}</p>

      <button onClick={addToLibrary} style={styles.btn}>
        ➕ Add to My Library
      </button>
    </div>
  );
}

const styles = {
  card: {
    background: "#12385eff",
    padding: 10,
    borderRadius: 6,
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  },
  img: {
    width: "100%",
    height: 240,
    objectFit: "cover",
    borderRadius: 4
  },
  btn: {
    marginTop: 8,
    width: "100%",
    padding: 6,
    cursor: "pointer"
  }
};
