package services

import (
	"context"
	"log"
	"net"
	"sync"
	"time"

	"mangahub-desktop/backend/udpclient"
	"mangahub-desktop/backend/utils"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type NotifyService struct {
	ctx         context.Context
	syncService *SyncService
	udpConn     *net.UDPConn
	isRunning   bool
	mu          sync.Mutex
}

func NewNotifyService(syncService *SyncService) *NotifyService {
	return &NotifyService{
		syncService: syncService,
	}
}

func (n *NotifyService) SetContext(ctx context.Context) {
	n.ctx = ctx
}

func (n *NotifyService) Start() error {
	n.mu.Lock()
	defer n.mu.Unlock()

	// Prevent double-starting
	if n.isRunning {
		log.Println("⚠️ NotifyService already running, skipping Start()")
		return nil
	}

	jwt, _ := utils.LoadToken()
	if jwt == "" {
		return nil // silent fail for UI
	}

	// 🔍 Discover server via UDP
	serverAddr, err := udpclient.DiscoverUDPServer(2 * time.Second)
	if err != nil {
		return err
	}
	_ = utils.SaveUDPServerAddr(serverAddr)

	// 📡 Register for UDP notifications
	if err := udpclient.RegisterUDPNotification(serverAddr, jwt); err != nil {
		return err
	}

	// 👂 Start UDP listener (background)
	go func() {
		conn, err := udpclient.StartUDPListenerWithHandler(3002, func(noti udpclient.Notification) {
			runtime.EventsEmit(n.ctx, "notify:manga", noti)
		})
		if err != nil {
			log.Printf("UDP listener error: %v", err)
			return
		}
		n.udpConn = conn
		log.Println("✅ UDP listener started on port 3002")
	}()

	n.isRunning = true
	log.Println("NotifyService started, ctx ready:", n.ctx != nil)

	if err != nil {
		log.Printf("Failed to load server IP addr: %v", err)
	} else {
		// 🔗 Auto-start TCP sync service
		if n.syncService != nil {
			go func() {
				// Small delay to ensure UDP listener is fully started
				time.Sleep(100 * time.Millisecond)

				if err := n.syncService.StartAutoConnect(); err != nil {
					log.Printf("Failed to auto-start TCP sync: %v\n", err)
				}
			}()
		}
	}

	return nil
}

func (n *NotifyService) Subscribe(mangaID string) error {
	jwt, _ := utils.LoadToken()
	addr, _ := utils.LoadUDPServerAddr()

	return udpclient.SubscribeMangaUDP(addr, jwt, mangaID)
}

// Stop closes the UDP listener connection
func (n *NotifyService) Stop() {
	n.mu.Lock()
	defer n.mu.Unlock()

	if n.udpConn != nil {
		n.udpConn.Close()
		log.Println("UDP listener closed")
	}
	n.isRunning = false
}
