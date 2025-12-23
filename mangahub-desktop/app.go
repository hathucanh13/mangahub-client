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
}

func NewApp() *App {
	base := "http://localhost:8080"
	return &App{
		Auth:    services.NewAuthService(base),
		Library: services.NewLibraryService(base),
		Notify:  services.NewNotifyService(),
		Manga:   services.NewMangaService(base),
		Chat:    services.NewChatService(),
	}
}

func (a *App) startup(ctx context.Context) {
	// Initialize logger
	if err := utils.InitLogger(); err != nil {
		log.Printf("Failed to initialize logger: %v", err)
	}

	// Forward ctx to services
	a.Notify.Startup(ctx)
	a.Chat.Startup(ctx)
	log.Println("NotifyService ctx forwarded")
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
