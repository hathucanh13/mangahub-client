package services

import (
	"context"
	"fmt"
	"log"
	"time"

	"mangahub-desktop/backend/udpclient"
	"mangahub-desktop/backend/utils"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type NotifyService struct {
	ctx         context.Context
	syncService *SyncService
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
		udpclient.StartUDPListenerWithHandler(3002, func(noti udpclient.Notification) {
			runtime.EventsEmit(n.ctx, "notify:manga", noti)
		})
	}()

	log.Println("NotifyService started, ctx ready:", n.ctx != nil)
	serverIP, err := utils.LoadServerIPAddr()
	if err != nil {
		fmt.Println("Failed to load server IP addr:", err)
	}

	// 🔗 Auto-start TCP sync service
	if n.syncService != nil {
		go func() {
			// Small delay to ensure UDP listener is fully started
			time.Sleep(100 * time.Millisecond)

			if err := n.syncService.StartAutoConnect(serverIP); err != nil {
				log.Printf("Failed to auto-start TCP sync: %v\n", err)
			}
		}()
	}

	return nil
}

func (n *NotifyService) Subscribe(mangaID string) error {
	jwt, _ := utils.LoadToken()
	addr, _ := utils.LoadUDPServerAddr()

	return udpclient.SubscribeMangaUDP(addr, jwt, mangaID)
}
