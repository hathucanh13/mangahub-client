package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"mangahub-desktop/backend/services"
	"mangahub-desktop/backend/udpclient"
	"mangahub-desktop/backend/utils"
)

// App struct
type App struct {
	ctx     context.Context
	Auth    *services.AuthService
	Library *services.LibraryService
	Notify  *services.NotifyService
	Manga   *services.MangaService
	Chat    *services.ChatService
	Sync    *services.SyncService
	GRPC    *services.GRPCService
	Admin   *services.AdminService
}

func NewApp() *App {
	// Initialize with placeholder, will be updated after server discovery
	base := "https://eb30ef8789b1.ngrok-free.app"

	syncService := services.NewSyncService()

	return &App{
		Auth:    services.NewAuthService(base),
		Library: services.NewLibraryService(base),
		Manga:   services.NewMangaService(base),
		Chat:    services.NewChatService(base),
		Sync:    syncService,
		GRPC:    services.NewGRPCService(),
		Admin:   services.NewAdminService(base),
		// Pass syncService to NotifyService so it can auto-start TCP
		Notify: services.NewNotifyService(syncService),
	}
}

// InitializeServices discovers the server and updates all service base URLs
func (a *App) InitializeServices() error {
	log.Println("🔍 Discovering server via UDP...")

	// Try to discover server IP
	serverIP, err := a.DiscoverServer()
	if err != nil {
		log.Printf("⚠️ Server discovery failed, using localhost: %v", err)
		serverIP = "localhost"
	}

	log.Printf("✅ Using server IP: %s", serverIP)

	// Update all HTTP services' BaseURL with discovered IP
	httpBaseURL := fmt.Sprintf("http://%s:8080", serverIP)
	wsBaseURL := fmt.Sprintf("ws://%s:8080", serverIP)

	a.Auth.BaseURL = httpBaseURL
	a.Library.BaseURL = httpBaseURL
	a.Manga.BaseURL = httpBaseURL
	a.Admin.BaseURL = httpBaseURL
	a.Chat.SetBaseURL(wsBaseURL)

	return nil
}

// DiscoverServer discovers the MangaHub server via UDP broadcast
func (a *App) DiscoverServer() (string, error) {
	serverAddr, err := udpclient.DiscoverUDPServer(3 * time.Second)
	if err != nil {
		return "", err
	}

	// Save the discovered server address
	if err := utils.SaveUDPServerAddr(serverAddr); err != nil {
		log.Printf("Failed to save server address: %v", err)
	}

	// Extract IP from address
	serverIP, err := utils.LoadServerIPAddr()
	if err != nil {
		return "", err
	}

	return serverIP, nil
}

func (a *App) startup(ctx context.Context) {
	// Initialize logger
	if err := utils.InitLogger(); err != nil {
		log.Printf("Failed to initialize logger: %v", err)
	}

	// Set context for ALL services FIRST before any Start() calls
	a.ctx = ctx
	a.Notify.SetContext(ctx)
	a.Chat.SetContext(ctx)
	a.Sync.SetContext(ctx)

	// Discover server and initialize services with correct IP
	if err := a.InitializeServices(); err != nil {
		log.Printf("Failed to initialize services: %v", err)
	}

	log.Println("All service contexts initialized")
	utils.LogInfo("App started successfully")
}

func (a *App) shutdown(ctx context.Context) {
	utils.LogInfo("App shutting down")
	if a.Notify != nil {
		a.Notify.Stop()
	}
	a.Sync.Stop()
	utils.CloseLogger()
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
