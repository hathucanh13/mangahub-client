import MangaCard from "../../components/MangaCard";
import { useEffect, useState } from "react";
import { ListAllMangas } from "../../../wailsjs/go/services/MangaService";

// TEMP mock data (replace with backend call later)

export default function HomePage() {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMangas();
  }, []);

  const loadMangas = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ListAllMangas();
      setMangas(data);
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
        <button onClick={loadMangas}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Browse Manga</h2>

      <div style={styles.grid}>
        {mangas.map((m) => (
          <MangaCard key={m.id} manga={m} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    display: "flex",
    flexDirection: "column",
    minHeight: "100%",
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
};