package services

import (
	"context"
	"log"
	"time"

	"mangahub-desktop/backend/udpclient"
	"mangahub-desktop/backend/utils"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type NotifyService struct {
	ctx context.Context
}

func NewNotifyService() *NotifyService {
	return &NotifyService{}
}

func (n *NotifyService) Startup(ctx context.Context) {
	n.ctx = ctx
}
func (n *NotifyService) Start() error {
	jwt, _ := utils.LoadToken()
	if jwt == "" {
		return nil // silent fail for UI
	}

	// 🔍 Discover
	serverAddr, err := udpclient.DiscoverUDPServer(2 * time.Second)
	if err != nil {
		return err
	}
	_ = utils.SaveUDPServerAddr(serverAddr)

	// 📡 Register
	if err := udpclient.RegisterUDPNotification(serverAddr, jwt); err != nil {
		return err
	}

	// 👂 Start listener (background)
	go func(ctx context.Context) {
		udpclient.StartUDPListenerWithHandler(3002, func(noti udpclient.Notification) {
			// ✅ SAFE: ctx captured after Startup
			runtime.EventsEmit(ctx, "notify:manga", noti)
		})
	}(n.ctx)
	log.Println("NotifyService ctx ready:", n.ctx != nil)

	return nil
}
func (n *NotifyService) Subscribe(mangaID string) error {
	jwt, _ := utils.LoadToken()
	addr, _ := utils.LoadUDPServerAddr()

	return udpclient.SubscribeMangaUDP(addr, jwt, mangaID)
}
