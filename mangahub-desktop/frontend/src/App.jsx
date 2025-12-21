import { useEffect, useState } from "react";
import LoginPage from "./pages/Login/Login";
import LibraryPage from "./pages/Library/Library";
import { Start } from "../wailsjs/go/services/NotifyService";
import { EventsOn } from "../wailsjs/runtime/runtime";
import { showToast } from "./utils/toast";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

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

  return loggedIn ? (
    <LibraryPage />
  ) : (
    <LoginPage onLogin={() => setLoggedIn(true)} />
  );
}

export default App;
