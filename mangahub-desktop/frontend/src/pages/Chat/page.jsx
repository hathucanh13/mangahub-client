import { useEffect, useState, useRef } from "react";
import { EventsOn } from "../../../wailsjs/runtime/runtime";
import {
  Connect,
  SendMessage,
  Disconnect,
  SwitchRoom,
  GetCurrentRoom,
} from "../../../wailsjs/go/services/ChatService";
import { GetCurrentUsername } from "../../../wailsjs/go/services/AuthService";

export default function ChatPage({ initialMangaId, initialMangaName }) {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentMangaName, setCurrentMangaName] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [online, setOnline] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const messagesEndRef = useRef(null);
  const hasConnectedRef = useRef(false);
  const isConnectingRef = useRef(false);
  const connectedToRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get current username
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const username = await GetCurrentUsername();
        setCurrentUser(username);
      } catch (err) {
        console.error("Failed to get username:", err);
      }
    };
    fetchUsername();
  }, []);

  // Auto-connect if initialMangaId is provided (only once per manga)
  useEffect(() => {
    if (!initialMangaId || !initialMangaName) return;
    
    // Skip if already connected to this manga or currently connecting
    if (connectedToRef.current === initialMangaId || isConnectingRef.current) {
      console.log(`⚠️ Already connected/connecting to ${initialMangaId}, skipping...`);
      return;
    }
    
    console.log(`🎯 Initiating connection to ${initialMangaId}...`);
    connectedToRef.current = initialMangaId;
    hasConnectedRef.current = true;
    joinRoom(initialMangaId, initialMangaName);
  }, [initialMangaId, initialMangaName]);

  useEffect(() => {
    let offMsg, offDisc, offConn;

    offMsg = EventsOn("chat:message", (m) => {
      console.log("📩 Frontend received message:", m);
      console.log("📩 Message type:", typeof m, "Is null?", m === null);
      
      // Normalize the message object
      const normalizedMsg = {
        type: m.type || m.Type || "",
        username: m.username || m.Username || "Unknown",
        message: m.message || m.Message || "",
        timestamp: m.timestamp || m.Timestamp || Date.now() / 1000,
        online: m.online || m.Online || 0,
      };
      
      console.log("📩 Normalized message:", normalizedMsg);
      
      setMessages((prev) => {
        console.log("📩 Previous messages count:", prev.length);
        const updated = [...prev, normalizedMsg];
        console.log("📩 Updated messages count:", updated.length);
        return updated;
      });

      if (normalizedMsg.type === "presence") {
        setOnline(normalizedMsg.online);
      }
    });

    offDisc = EventsOn("chat:disconnected", () => {
      console.log("🔌 Chat disconnected");
      setCurrentRoom(null);
      isConnectingRef.current = false;
    });

    offConn = EventsOn("chat:connected", (room) => {
      console.log("✅ Connected to room:", room);
      setCurrentRoom(room);
      setIsConnecting(false);
      isConnectingRef.current = false;
    });

    return () => {
      console.log("🧹 Cleaning up chat listeners");
      offMsg && offMsg();
      offDisc && offDisc();
      offConn && offConn();
      Disconnect();
      hasConnectedRef.current = false;
      isConnectingRef.current = false;
      connectedToRef.current = null;
    };
  }, []);

  const joinRoom = async (mangaId, mangaName) => {
    if (isConnectingRef.current) {
      console.log("⚠️ Already connecting, skipping...");
      return;
    }

    isConnectingRef.current = true;
    setIsConnecting(true);
    setMessages([]);
    setCurrentMangaName(mangaName);

    try {
      if (currentRoom) {
        await SwitchRoom(`${mangaId}`);
      } else {
        await Connect("ws://localhost:8080", `${mangaId}`);
      }
      setCurrentRoom(`${mangaId}`);
    } catch (err) {
      console.error("Failed to join room:", err);
      alert(err?.message || "Failed to join chat room");
      isConnectingRef.current = false;
    } finally {
      setIsConnecting(false);
    }
  };

  const send = async () => {
    if (!input.trim() || !currentRoom) return;
    try {
      await SendMessage(input);
      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!currentRoom) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💬</div>
          <h2 style={styles.emptyTitle}>No Chat Room Selected</h2>
          <p style={styles.emptyText}>
            Browse manga and click "Join Discussion" to start chatting!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Chat Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.roomTitle}>💬 {currentMangaName || currentRoom}</h2>
          <div style={styles.onlineBadge}>
            <span style={styles.onlineDot} />
            {online} online
          </div>
        </div>
        <button onClick={() => {
          Disconnect();
          setCurrentRoom(null);
          setMessages([]);
        }} style={styles.leaveButton}>
          Leave Room
        </button>
      </div>

      {/* Messages Area */}
      <div style={styles.messagesContainer}>
        {isConnecting ? (
          <div style={styles.loadingState}>Connecting...</div>
        ) : messages.length === 0 ? (
          <div style={styles.emptyMessages}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((m, i) => {
            console.log(`🎨 Rendering message ${i}:`, m);
            
            // Normalize message object (handle both lowercase and uppercase)
            const msg = {
              type: m.type || m.Type || "",
              username: m.username || m.Username || "Unknown",
              message: m.message || m.Message || "",
              timestamp: m.timestamp || m.Timestamp || 0,
              online: m.online || m.Online || 0,
            };

            const isCurrentUser = msg.username === currentUser;

            return (
              <div
                key={i}
                style={{
                  ...styles.messageWrapper,
                  ...(msg.type === "system" ? styles.systemWrapper : {}),
                  ...(isCurrentUser ? styles.currentUserWrapper : styles.otherUserWrapper)
                }}
              >
                {msg.type === "system" ? (
                  <div style={styles.systemMessage}>
                    <span style={styles.systemIcon}>ℹ️</span>
                    {msg.message}
                  </div>
                ) : (
                  <div style={isCurrentUser ? styles.currentUserMessage : styles.chatMessage}>
                    <div style={styles.messageHeader}>
                      <span style={isCurrentUser ? styles.currentUserUsername : styles.username}>
                        {msg.username}
                      </span>
                      <span style={isCurrentUser ? styles.currentUserTimestamp : styles.timestamp}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div style={isCurrentUser ? styles.currentUserMessageText : styles.messageText}>
                      {msg.message}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={styles.inputContainer}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${currentMangaName || currentRoom}...`}
          onKeyDown={(e) => e.key === "Enter" && send()}
          style={styles.input}
          disabled={isConnecting}
        />
        <button
          onClick={send}
          style={styles.sendButton}
          disabled={isConnecting || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(135deg, rgba(255, 240, 245, 0.3) 0%, rgba(255, 250, 240, 0.3) 100%)",
    backdropFilter: "blur(12px)",
    borderRadius: 24,
    overflow: "hidden",
  },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 240, 245, 0.9) 100%)",
    borderBottom: "2px solid rgba(255, 182, 185, 0.3)",
    boxShadow: "0 2px 8px rgba(255, 182, 185, 0.1)",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },

  roomTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    background: "linear-gradient(135deg, #ff9a9e 0%, #ffc9a0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  onlineBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    borderRadius: 50,
    background: "rgba(255, 182, 185, 0.2)",
    border: "1px solid rgba(255, 182, 185, 0.3)",
    fontSize: 13,
    fontWeight: 600,
    color: "#ff8ba7",
  },

  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#4ade80",
    boxShadow: "0 0 8px rgba(74, 222, 128, 0.6)",
  },

  leaveButton: {
    padding: "10px 20px",
    borderRadius: 50,
    border: "2px solid rgba(255, 182, 185, 0.4)",
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 240, 245, 0.8) 100%)",
    color: "#ff8ba7",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  // Messages
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  messageWrapper: {
    display: "flex",
    width: "100%",
  },

  systemWrapper: {
    justifyContent: "center",
  },

  currentUserWrapper: {
    justifyContent: "flex-end",
  },

  otherUserWrapper: {
    justifyContent: "flex-start",
  },

  chatMessage: {
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 240, 245, 0.9) 100%)",
    backdropFilter: "blur(8px)",
    padding: "10px 14px",
    borderRadius: 16,
    border: "2px solid rgba(255, 182, 185, 0.3)",
    boxShadow: "0 2px 8px rgba(255, 182, 185, 0.15)",
    maxWidth: "70%",
  },

  currentUserMessage: {
    background: "linear-gradient(135deg, #ff9a9e 0%, #ffc9a0 100%)",
    backdropFilter: "blur(8px)",
    padding: "10px 14px",
    borderRadius: 16,
    border: "2px solid rgba(255, 255, 255, 0.4)",
    boxShadow: "0 4px 12px rgba(255, 154, 158, 0.3)",
    maxWidth: "70%",
  },

  messageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    gap: 12,
  },

  username: {
    fontWeight: 700,
    fontSize: 13,
    color: "#ff6b9d",
  },

  currentUserUsername: {
    fontWeight: 700,
    fontSize: 13,
    color: "#ffffff",
    opacity: 0.9,
  },

  timestamp: {
    fontSize: 11,
    color: "#ff8ba7",
    opacity: 0.6,
  },

  currentUserTimestamp: {
    fontSize: 11,
    color: "#ffffff",
    opacity: 0.7,
  },

  messageText: {
    fontSize: 14,
    color: "#ff8ba7",
    lineHeight: 1.4,
    fontWeight: 500,
  },

  currentUserMessageText: {
    fontSize: 14,
    color: "#ffffff",
    lineHeight: 1.4,
    fontWeight: 500,
  },

  systemMessage: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 16px",
    borderRadius: 50,
    background: "rgba(255, 182, 185, 0.2)",
    border: "1px solid rgba(255, 182, 185, 0.3)",
    fontSize: 13,
    color: "#ff8ba7",
    fontStyle: "italic",
  },

  systemIcon: {
    fontSize: 14,
  },

  // Input
  inputContainer: {
    display: "flex",
    gap: 12,
    padding: "20px 24px",
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 240, 245, 0.9) 100%)",
    borderTop: "2px solid rgba(255, 182, 185, 0.3)",
  },

  input: {
    flex: 1,
    padding: "14px 20px",
    borderRadius: 50,
    border: "2px solid rgba(255, 182, 185, 0.4)",
    background: "rgba(255, 255, 255, 0.8)",
    color: "#ff8ba7",
    fontSize: 14,
    fontWeight: 500,
    outline: "none",
    transition: "all 0.3s ease",
  },

  sendButton: {
    padding: "14px 32px",
    borderRadius: 50,
    border: "2px solid rgba(255, 255, 255, 0.8)",
    background: "linear-gradient(135deg, #ff9a9e 0%, #ffc9a0 100%)",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(255, 154, 158, 0.3)",
  },

  // Empty States
  emptyState: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },

  emptyTitle: {
    margin: "0 0 12px 0",
    fontSize: 24,
    fontWeight: 700,
    background: "linear-gradient(135deg, #ff9a9e 0%, #ffc9a0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  emptyText: {
    margin: 0,
    fontSize: 15,
    color: "#ff8ba7",
    fontWeight: 500,
    maxWidth: 400,
  },

  emptyMessages: {
    textAlign: "center",
    padding: 40,
    fontSize: 15,
    color: "#ff8ba7",
    opacity: 0.6,
    fontStyle: "italic",
  },

  loadingState: {
    textAlign: "center",
    padding: 40,
    fontSize: 15,
    color: "#ff8ba7",
    fontWeight: 500,
  },
};

// Add hover effects for interactive elements
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 154, 158, 0.4) !important;
  }
  
  input:focus {
    border-color: #ff6b9d !important;
    box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.15), 0 4px 12px rgba(255, 182, 185, 0.3) !important;
  }
  
  button:active {
    transform: translateY(0);
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
document.head.appendChild(styleSheet);