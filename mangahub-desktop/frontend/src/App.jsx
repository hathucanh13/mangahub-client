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
import InternalServicePage from "./pages/InternalService/page";
import AdminPage from "./pages/Admin/page";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedMangaId, setSelectedMangaId] = useState(null);
  const [tab, setTab] = useState("home");
  const [backgroundMode, setBackgroundMode] = useState("default");
  const [chatMangaId, setChatMangaId] = useState(null);
  const [chatMangaName, setChatMangaName] = useState("");
  
  // Store sync broadcasts at app level so they persist across tab changes
  const [syncBroadcasts, setSyncBroadcasts] = useState([]);
  
  // Cache latest sync status per manga

  console.log("App rendered, loggedIn:", loggedIn);

  const handleJoinChat = (mangaId, mangaName) => {
    setChatMangaId(mangaId);
    setChatMangaName(mangaName);
    setTab("chat");
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setTab("home");
    showToast("👋 Logged out successfully");
  };

  useEffect(() => {
    Start().then(() => {
      console.log("NotifyService started");
    });

    // Listen for manga notifications from UDP
    const offManga = EventsOn("notify:manga", (n) => {
      console.log("📢 notify:manga event", n);
      showToast(`📢 ${n.MangaID} - Chapter ${n.Chapter}`);
    });

    // Listen for server discovery
    const offServer = EventsOn("notify:server_discovered", (data) => {
      console.log("🌐 Server discovered:", data.ip);
      showToast(`🌐 Server connected: ${data.ip}`);
    });

    // Listen for TCP sync progress broadcasts
    const offSync = EventsOn("sync:progress", (broadcast) => {
      console.log("📖 Sync progress:", broadcast);
      
     
      
      // Add broadcast to state for Library to consume
      setSyncBroadcasts(prev => [...prev, {
        ...broadcast,
        timestamp: new Date().toISOString() // Add client-side timestamp
      }]);
      
      const chapterDiff = broadcast.current_chapter - broadcast.previous_chapter;
      const diffText = chapterDiff > 0 ? ` (+${chapterDiff})` : "";
      
      // Show toast notification
      showToast(
        `📖 ${broadcast.manga_id}: Ch ${broadcast.previous_chapter} → ${broadcast.current_chapter}`,
        {
          duration: 5000,
          onClick: () => {
            setTab("library");
          }
        }
      );
    });

    return () => {
      offManga();
      offServer();
      offSync();
    };
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
      <div className="app-background" data-mode={backgroundMode} />
      <div className="app-content">
        <Navbar current={tab} onChange={setTab} onLogout={handleLogout} />

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

        {tab === "library" && (
          <LibraryPage 
            syncBroadcasts={syncBroadcasts}
            onBroadcastProcessed={() => setSyncBroadcasts([])}
          />
        )}
        
        {tab === "chat" && (
          <ChatPage
            initialMangaId={chatMangaId}
            initialMangaName={chatMangaName}
          />
        )}

        {tab === "internal" && <InternalServicePage />}

        {tab === "admin" && <AdminPage />}
      </div>
    </div>
  );
}

export default App;