import { useEffect, useState } from "react";
import LoginPage from "./pages/Login/Login";
import LibraryPage from "./pages/Library/page";
import { Start } from "../wailsjs/go/services/NotifyService";
import { EventsOn } from "../wailsjs/runtime/runtime";
import { showToast } from "./utils/toast";
import Navbar from "./components/Navbar";
import HomePage from "./pages/Home/page";
import MangaDetailPage from "./pages/MangaDetail/page";
import ChatPage from "./pages/Chat/page";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedMangaId, setSelectedMangaId] = useState(null);
  const [tab, setTab] = useState("home");
  const [backgroundMode, setBackgroundMode] = useState("default");
  const [chatMangaId, setChatMangaId] = useState(null);
  const [chatMangaName, setChatMangaName] = useState("");

  console.log("App rendered, loggedIn:", loggedIn);

  const handleJoinChat = (mangaId, mangaName) => {
    setChatMangaId(mangaId);
    setChatMangaName(mangaName);
    setTab("chat");
  };

  useEffect(() => {
    Start().then(() => {
      console.log("NotifyService started");
    });

    const off = EventsOn("notify:manga", (n) => {
      console.log("📢 notify:manga event", n);
      showToast(`📢 ${n.MangaID} - Chapter ${n.Chapter}`);
    });

    return off;
  }, []);

  if (!loggedIn) {
    return (
      <div className="app-root">
        <div className="app-background" data-mode={backgroundMode} />
        <LoginPage onLogin={() => setLoggedIn(true)} />
      </div>
    );
  }

  return (
    <div className="app-root">
      {/* ✅ Added data-mode={backgroundMode} */}
      <div className="app-background" data-mode={backgroundMode} />
      <div className="app-content">
        <Navbar current={tab} onChange={setTab} />

        {tab === "home" && !selectedMangaId && (
          <HomePage
            onSelectManga={setSelectedMangaId}
            setBackgroundMode={setBackgroundMode}
          />
        )}

        {tab === "home" && selectedMangaId && (
          <MangaDetailPage
            mangaId={selectedMangaId}
            onBack={() => setSelectedMangaId(null)}
            setBackgroundMode={setBackgroundMode}
            onJoinChat={handleJoinChat}
          />
        )}

        {tab === "library" && <LibraryPage />}
        {tab === "chat" && (
          <ChatPage
            initialMangaId={chatMangaId}
            initialMangaName={chatMangaName}
          />
        )}
      </div>
    </div>
  );
}

export default App;