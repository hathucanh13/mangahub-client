package main

import (
	"context"
	"fmt"
	"log"
	"mangahub-desktop/backend/services"
)

// App struct
type App struct {
	ctx     context.Context
	Auth    *services.AuthService
	Library *services.LibraryService
	Notify  *services.NotifyService
	Manga   *services.MangaService
}

func NewApp() *App {
	base := "http://localhost:8080"
	return &App{
		Auth:    services.NewAuthService(base),
		Library: services.NewLibraryService(base),
		Notify:  services.NewNotifyService(),
		Manga:   services.NewMangaService(base),
	}
}

func (a *App) startup(ctx context.Context) {
	// Forward ctx to services
	a.Notify.Startup(ctx)
	log.Println("NotifyService ctx forwarded")
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
