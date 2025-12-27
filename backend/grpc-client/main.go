package grpcclient

import (
	"context"
	"fmt"
	"log"
	"time"

	pb "mangahub-desktop/backend/grpc-client/manga"
	"mangahub-desktop/backend/utils"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/status"
)

func NewMangaClient() (pb.MangaServiceClient, func(), error) {

	serverAddr, _ := utils.LoadServerIPAddr()
	grpcAddress := fmt.Sprintf("%s:9092", serverAddr)
	conn, err := grpc.NewClient(
		grpcAddress,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		return nil, nil, err
	}

	cleanup := func() {
		_ = conn.Close()
	}

	return pb.NewMangaServiceClient(conn), cleanup, nil
}

func newContext() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), 5*time.Second)
}

func StartGRPCClientServer() {
	// Connect to server
	serverAddr, _ := utils.LoadServerIPAddr()
	grpcAddress := fmt.Sprintf("%s:9092", serverAddr)
	conn, err := grpc.NewClient(grpcAddress,
		grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	fmt.Println("Connected to gRPC server at", grpcAddress)
	defer conn.Close()

}

func GetMangaByID(mangaID string) (map[string]string, error) {
	client, cleanup, err := NewMangaClient()
	if err != nil {
		return nil, err
	}
	defer cleanup()

	ctx, cancel := newContext()
	defer cancel()

	resp, err := client.GetManga(ctx, &pb.GetMangaRequest{
		MangaId: mangaID,
	})
	if err != nil {
		st, _ := status.FromError(err)
		return nil, fmt.Errorf(st.Message())
	}

	result := map[string]string{
		"id":          resp.Manga.Id,
		"title":       resp.Manga.Title,
		"author":      resp.Manga.Author,
		"description": resp.Manga.Description,
	}

	return result, nil
}
func UpdateProgress(mangaID string, chapter int64) error {
	client, cleanup, err := NewMangaClient()
	if err != nil {
		return err
	}
	defer cleanup()

	ctx, cancel := newContext()
	token, _ := utils.LoadToken()
	claims, err := utils.ValidateToken(token)
	if err != nil {
		return err
	}
	userID := claims.UserId

	defer cancel()

	resp, err := client.UpdateProgress(ctx, &pb.UpdateProgressRequest{
		UserId:  userID,
		MangaId: mangaID,
		Chapter: chapter,
	})
	if err != nil {
		st, _ := status.FromError(err)
		return fmt.Errorf(st.Message())
	}

	if resp.Success {
		fmt.Printf("✅ Progress updated successfully via gRPC!\n")
		fmt.Printf("📖 Manga: %s | Chapter: %d\n", mangaID, chapter)
		fmt.Println("📡 Broadcasting to synced devices...")
	} else {
		fmt.Println("❌ Update failed")
	}

	return nil
}

func SearchManga(keyword string, page int32, pageSize int32) ([]map[string]string, int64, error) {
	client, cleanup, err := NewMangaClient()
	if err != nil {
		return nil, 0, err
	}
	defer cleanup()

	ctx, cancel := newContext()
	defer cancel()

	resp, err := client.Search(ctx, &pb.SearchMangaRequest{
		Keyword:  keyword,
		Page:     page,
		PageSize: pageSize,
	})
	if err != nil {
		st, _ := status.FromError(err)
		return nil, 0, fmt.Errorf(st.Message())
	}

	results := make([]map[string]string, 0, len(resp.Results))
	for _, manga := range resp.Results {
		results = append(results, map[string]string{
			"id":          manga.Id,
			"title":       manga.Title,
			"author":      manga.Author,
			"description": manga.Description,
		})
	}

	return results, resp.Total, nil
}
