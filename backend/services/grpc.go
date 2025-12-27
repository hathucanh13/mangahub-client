package services

import (
	grpcclient "mangahub-desktop/backend/grpc-client"
)

type GRPCService struct{}

func NewGRPCService() *GRPCService {
	return &GRPCService{}
}

// GetMangaByID fetches manga details via gRPC
func (g *GRPCService) GetMangaByID(mangaID string) (map[string]string, error) {
	return grpcclient.GetMangaByID(mangaID)
}

// UpdateProgress updates reading progress via gRPC
func (g *GRPCService) UpdateProgress(mangaID string, chapter int64) error {
	return grpcclient.UpdateProgress(mangaID, chapter)
}

// StartGRPCClient starts the gRPC client connection
func (g *GRPCService) StartGRPCClient() {
	grpcclient.StartGRPCClientServer()
}

// SearchResult represents a search result with manga list and total count
type SearchResult struct {
	Results []map[string]string `json:"results"`
	Total   int64               `json:"total"`
}

// SearchManga searches for manga by keyword via gRPC
func (g *GRPCService) SearchManga(keyword string, page int32, pageSize int32) (*SearchResult, error) {
	results, total, err := grpcclient.SearchManga(keyword, page, pageSize)
	if err != nil {
		return nil, err
	}
	return &SearchResult{
		Results: results,
		Total:   total,
	}, nil
}
