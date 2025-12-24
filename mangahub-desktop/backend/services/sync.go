package services

import (
	"context"
	"encoding/json"
	"fmt"
	"mangahub-desktop/backend/utils"
	"net"
	"sync"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type SyncService struct {
	ctx        context.Context
	conn       net.Conn
	isRunning  bool
	mu         sync.Mutex
	cancelFunc context.CancelFunc
	deviceID   string
}

type ProgressBroadcast struct {
	Type              string    `json:"type"`
	MangaID           string    `json:"manga_id"`
	MangaTitle        string    `json:"manga_title"`
	PreviousChapter   int       `json:"previous_chapter"`
	CurrentChapter    int       `json:"current_chapter"`
	UpdatedAt         time.Time `json:"updated_at"`
	DevicesSynced     int       `json:"devices_synced"`
	TotalChaptersRead int       `json:"total_chapters_read"`
	ReadingStreak     int       `json:"reading_streak"`
}

func NewSyncService() *SyncService {
	return &SyncService{
		deviceID: generateDeviceID(),
	}
}

func (s *SyncService) SetContext(ctx context.Context) {
	s.ctx = ctx
}

func generateDeviceID() string {
	return fmt.Sprintf("device-%d", time.Now().UnixNano()%1000000)
}

// StartAutoConnect automatically starts after UDP discovers server IP
func (s *SyncService) StartAutoConnect(serverIP string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.isRunning {
		fmt.Println("Sync service already running")
		return nil
	}

	token, _ := utils.LoadToken()
	if token == "" {
		return fmt.Errorf("not authenticated")
	}

	// Create cancellable context
	ctx, cancel := context.WithCancel(s.ctx)
	s.cancelFunc = cancel

	// Connect to TCP server on port 9090
	conn, err := net.DialTimeout("tcp", serverIP+":9090", 10*time.Second)
	if err != nil {
		cancel()
		fmt.Printf("Failed to connect to sync server: %v\n", err)
		return err
	}

	s.conn = conn
	s.isRunning = true

	// Send handshake
	handshake := map[string]string{
		"token":     token,
		"device_id": s.deviceID,
	}

	if err := json.NewEncoder(conn).Encode(handshake); err != nil {
		conn.Close()
		s.isRunning = false
		cancel()
		fmt.Printf("Handshake failed: %v\n", err)
		return err
	}

	fmt.Printf("TCP sync connected to %s with device ID: %s\n", serverIP, s.deviceID)

	// Start listening for broadcasts in background
	go s.listen(ctx)

	return nil
}

// Stop disconnects from the sync server
func (s *SyncService) Stop() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.isRunning {
		return nil
	}

	if s.cancelFunc != nil {
		s.cancelFunc()
	}

	if s.conn != nil {
		s.conn.Close()
	}

	s.isRunning = false
	fmt.Println("TCP sync disconnected")

	return nil
}

// listen continuously reads broadcast messages from TCP connection
func (s *SyncService) listen(ctx context.Context) {
	defer func() {
		s.mu.Lock()
		if s.conn != nil {
			s.conn.Close()
		}
		s.isRunning = false
		s.mu.Unlock()
		fmt.Println("TCP listener stopped")
	}()

	decoder := json.NewDecoder(s.conn)

	for {
		select {
		case <-ctx.Done():
			return
		default:
			// Set read deadline
			s.conn.SetReadDeadline(time.Now().Add(60 * time.Second))

			var broadcast ProgressBroadcast
			if err := decoder.Decode(&broadcast); err != nil {
				// Check if it's a timeout
				if netErr, ok := err.(net.Error); ok && netErr.Timeout() {
					continue
				}

				// Connection error
				fmt.Printf("TCP connection error: %v\n", err)
				return
			}

			// Successfully received broadcast - emit to frontend
			fmt.Printf("SYNC UPDATE: %s → chapter %d (devices: %d)\n Time: %s\n",
				broadcast.MangaID,
				broadcast.CurrentChapter,
				broadcast.DevicesSynced,
				broadcast.UpdatedAt.Format(time.RFC3339),
			)

			// Emit event for toast notification
			runtime.EventsEmit(s.ctx, "sync:progress", broadcast)
		}
	}
}
