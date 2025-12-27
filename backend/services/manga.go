package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"mangahub-desktop/backend/models"
)

type MangaService struct {
	BaseURL string
}

func NewMangaService(baseURL string) *MangaService {
	return &MangaService{BaseURL: baseURL}
}

func (l *MangaService) ListMangas(
	page int,
	pageSize int,
	genres []string,
	sortBy string,
) (*models.PaginatedMangasResponse, error) {

	var url string

	switch {
	case len(genres) > 0:
		joined := strings.Join(genres, ",")
		url = fmt.Sprintf(
			"%s/manga/filter/genre?query=%s&page=%d&page_size=%d",
			l.BaseURL,
			joined,
			page,
			pageSize,
		)
	default:
		url = fmt.Sprintf(
			"%s/manga?page=%d&page_size=%d",
			l.BaseURL,
			page,
			pageSize,
		)
	}

	// Add sort_by parameter if provided
	if sortBy != "" {
		url = fmt.Sprintf("%s&sort_by=%s", url, sortBy)
	}

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed %s: %s", resp.Status, string(body))
	}

	var response models.PaginatedMangasResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, err
	}

	return &response, nil
}

func (l *MangaService) ListMangaDetail(id string) (*models.Manga, error) {
	url := fmt.Sprintf("%s/manga/%s", l.BaseURL, id)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to load manga detail: %s", string(body))
	}

	var manga models.Manga
	if err := json.NewDecoder(resp.Body).Decode(&manga); err != nil {
		return nil, err
	}

	return &manga, nil
}
func (l *MangaService) SearchMangas(query string) ([]models.Manga, error) {
	url := fmt.Sprintf("%s/manga/search?query=%s", l.BaseURL, query)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("search failed: %s", string(body))
	}
	var mangas []models.Manga
	if err := json.NewDecoder(resp.Body).Decode(&mangas); err != nil {
		return nil, err
	}
	return mangas, nil
}
