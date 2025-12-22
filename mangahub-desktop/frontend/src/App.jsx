import { useEffect, useState } from "react";
import LoginPage from "./pages/Login/Login";
import LibraryPage from "./pages/Library/page";
import { Start } from "../wailsjs/go/services/NotifyService";
import { EventsOn } from "../wailsjs/runtime/runtime";
import { showToast } from "./utils/toast";
import Navbar from "./components/Navbar";
import HomePage from "./pages/Home/page";
import ChatPage from "./pages/Chat/page";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  console.log("App rendered, loggedIn:", loggedIn);

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
  const [tab, setTab] = useState("home");
  if (!loggedIn) {
    return (
      <div className="app-root">
        <div className="app-background" />
        <LoginPage onLogin={() => setLoggedIn(true)} />
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="app-background" />
      <div className="app-content">
        <Navbar current={tab} onChange={setTab} />
        {tab === "home" && <HomePage />}
        {tab === "library" && <LibraryPage />}
        {tab === "chat" && <ChatPage />}
      </div>
    </div>
  );
}

export default App;
