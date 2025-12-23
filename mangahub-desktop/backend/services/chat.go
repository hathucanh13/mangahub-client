package services

import (
	"context"
	"encoding/json"
	"fmt"
	"mangahub-desktop/backend/utils"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type ChatMessage struct {
	Type      string `json:"type"`
	Room      string `json:"room"`
	UserID    int64  `json:"user_id,omitempty"`
	Username  string `json:"username,omitempty"`
	Message   string `json:"message"`
	Timestamp int64  `json:"timestamp"`
	Online    int    `json:"online,omitempty"`
}

type RoomInfo struct {
	RoomID    string `json:"room_id"`
	MangaID   string `json:"manga_id"`
	MangaName string `json:"manga_name"`
	Online    int    `json:"online"`
	LastMsg   string `json:"last_msg,omitempty"`
}

type ChatService struct {
	ctx          context.Context
	conn         *websocket.Conn
	room         string
	wsBaseURL    string
	mu           sync.Mutex
	cancelRead   context.CancelFunc
	isConnecting bool
}

func NewChatService() *ChatService {
	return &ChatService{}
}

func (c *ChatService) Startup(ctx context.Context) {
	c.ctx = ctx
}

// GetCurrentRoom returns the currently connected room ID
func (c *ChatService) GetCurrentRoom() string {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.room
}

// IsConnected checks if currently connected to any room
func (c *ChatService) IsConnected() bool {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.conn != nil
}

func (c *ChatService) Connect(wsBaseURL string, room string) error {
	c.mu.Lock()

	// Prevent concurrent connection attempts
	if c.isConnecting {
		c.mu.Unlock()
		fmt.Println("⚠️ Connection already in progress, ignoring...")
		return fmt.Errorf("connection already in progress")
	}
	c.isConnecting = true

	// Stop existing readLoop and close connection if switching rooms
	if c.cancelRead != nil {
		fmt.Println("🛑 Cancelling existing read loop...")
		c.cancelRead()
	}
	if c.conn != nil {
		utils.LogInfo("🛑 Closing existing connection...")
		c.conn.Close()
	}
	c.mu.Unlock()

	// Give old goroutine time to fully exit
	utils.LogInfo("⏳ Waiting for old connection cleanup...")
	time.Sleep(300 * time.Millisecond)

	url := fmt.Sprintf("%s/ws/chat?room=%s", wsBaseURL, room)
	utils.LogInfo(fmt.Sprintf("🔌 Connecting to chat room at %s", url))

	jwt, err := utils.LoadToken()
	if err != nil {
		c.mu.Lock()
		c.isConnecting = false
		c.mu.Unlock()
		return fmt.Errorf("unauthorized, please signup or log in. Error %v", err)
	}
	header := http.Header{}
	header.Set("Authorization", "Bearer "+jwt)

	conn, _, err := websocket.DefaultDialer.Dial(url, header)
	if err != nil {
		c.mu.Lock()
		c.isConnecting = false
		c.mu.Unlock()
		return err
	}

	// Create cancellable context for readLoop
	readCtx, cancel := context.WithCancel(context.Background())

	c.mu.Lock()
	c.conn = conn
	c.room = room
	c.wsBaseURL = wsBaseURL
	c.cancelRead = cancel
	c.isConnecting = false
	c.mu.Unlock()

	utils.LogInfo("✅ Connection established, starting read loop...")
	go c.readLoop(readCtx)

	// Emit connected event on success
	c.mu.Lock()
	ctx := c.ctx
	c.mu.Unlock()
	if ctx != nil {
		runtime.EventsEmit(ctx, "chat:connected", room)
	}

	return nil
}

func (c *ChatService) readLoop(readCtx context.Context) {
	defer utils.LogInfo("🛑 Read loop exited")

	for {
		// Check if we should stop (non-blocking check)
		select {
		case <-readCtx.Done():
			utils.LogInfo("🛑 Read loop cancelled")
			return
		default:
		}

		c.mu.Lock()
		conn := c.conn
		ctx := c.ctx
		c.mu.Unlock()

		if conn == nil {
			utils.LogInfo("🛑 Connection is nil, exiting read loop")
			return
		}

		// Simple blocking read like CLI client - no deadlines
		_, msg, err := conn.ReadMessage()
		if err != nil {
			utils.LogError(fmt.Sprintf("❌ Read error: %v", err))
			if ctx != nil {
				runtime.EventsEmit(ctx, "chat:disconnected")
			}
			return
		}

		var m ChatMessage
		if err := json.Unmarshal(msg, &m); err != nil {
			// Fallback: treat as plain text message
			utils.LogDebug(fmt.Sprintf("📨 Plain text message: %s", string(msg)))
			m = ChatMessage{
				Type:      "chat",
				Message:   string(msg),
				Timestamp: time.Now().Unix(),
			}
		}

		// Check if message field contains nested JSON (from your server)
		if m.Message != "" && len(m.Message) > 0 && (m.Message[0] == '{' || m.Message[0] == '[') {
			var nested ChatMessage
			if err := json.Unmarshal([]byte(m.Message), &nested); err == nil {
				// Use the nested message instead
				if nested.Message != "" {
					m.Message = nested.Message
				}
				if nested.Type != "" {
					m.Type = nested.Type
				}
				if nested.Username != "" {
					m.Username = nested.Username
				}
				if nested.Timestamp > 0 {
					m.Timestamp = nested.Timestamp
				}
			}
		}

		utils.LogInfo(fmt.Sprintf("📨 Received message: type=%s, user=%s, msg=%s", m.Type, m.Username, m.Message))

		// Server history messages already contain timestamps
		if ctx != nil {
			runtime.EventsEmit(ctx, "chat:message", m)
		}
	}
}

func (c *ChatService) SendMessage(text string) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.conn == nil {
		return fmt.Errorf("not connected to any room")
	}

	// Send plain text like the CLI client does
	return c.conn.WriteMessage(websocket.TextMessage, []byte(text))
}

// SwitchRoom disconnects from current room and connects to new one
func (c *ChatService) SwitchRoom(room string) error {
	c.mu.Lock()
	wsBaseURL := c.wsBaseURL
	c.mu.Unlock()

	if wsBaseURL == "" {
		return fmt.Errorf("no previous connection established")
	}

	return c.Connect(wsBaseURL, room)
}

func (c *ChatService) Disconnect() {
	c.mu.Lock()
	defer c.mu.Unlock()

	utils.LogInfo("🔌 Disconnecting chat service...")

	// Stop read loop
	if c.cancelRead != nil {
		c.cancelRead()
		c.cancelRead = nil
	}

	// Close connection
	if c.conn != nil {
		c.conn.Close()
		c.conn = nil
		c.room = ""
	}

	c.isConnecting = false
	utils.LogInfo("✅ Chat service disconnected")
}
