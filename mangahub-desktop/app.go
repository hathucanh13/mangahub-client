package main

import (
	"context"
	"fmt"
	"log"
	"mangahub-desktop/backend/services"
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
}

func NewApp() *App {
	base := "http://localhost:8080"
	syncService := services.NewSyncService()

	return &App{
		Auth:    services.NewAuthService(base),
		Library: services.NewLibraryService(base),
		Manga:   services.NewMangaService(base),
		Chat:    services.NewChatService(),
		Sync:    syncService,
		GRPC:    services.NewGRPCService(),
		// Pass syncService to NotifyService so it can auto-start TCP
		Notify: services.NewNotifyService(syncService),
	}
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

	log.Println("All service contexts initialized")
	utils.LogInfo("App started successfully")
}

func (a *App) shutdown(ctx context.Context) {
	utils.LogInfo("App shutting down")
	utils.CloseLogger()
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
