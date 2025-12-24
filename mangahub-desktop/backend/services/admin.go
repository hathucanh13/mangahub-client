package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"mangahub-desktop/backend/utils"
)

type AdminService struct {
	BaseURL string
}

func NewAdminService(baseURL string) *AdminService {
	return &AdminService{BaseURL: baseURL}
}

type UpdateMangaRequest struct {
	ID            string   `json:"id"`
	Title         string   `json:"title,omitempty"`
	Author        string   `json:"author,omitempty"`
	Artist        string   `json:"artist,omitempty"`
	Genres        []string `json:"genres,omitempty"`
	ChapterCount  int      `json:"chapter_count,omitempty"`
	VolumeCount   int      `json:"volume_count,omitempty"`
	PublishedYear int      `json:"published_year,omitempty"`
	Status        string   `json:"status,omitempty"`
	Popularity    int      `json:"popularity,omitempty"`
	Ranking       int      `json:"ranking,omitempty"`
}

type UpdateChapterRequest struct {
	MangaID string `json:"manga_id"`
	Chapter int    `json:"chapter"`
}

// UpdateManga updates manga details (admin only)
func (a *AdminService) UpdateManga(mangaID, title, author, artist, status string, genres []string, chapters, volumes, year, popularity, ranking int) error {
	token, err := utils.LoadToken()
	if err != nil {
		return fmt.Errorf("not logged in")
	}

	req := UpdateMangaRequest{
		ID: mangaID,
	}

	if title != "" {
		req.Title = title
	}
	if author != "" {
		req.Author = author
	}
	if artist != "" {
		req.Artist = artist
	}
	if len(genres) > 0 {
		req.Genres = genres
	}
	if chapters > 0 {
		req.ChapterCount = chapters
	}
	if volumes > 0 {
		req.VolumeCount = volumes
	}
	if year > 0 {
		req.PublishedYear = year
	}
	if status != "" {
		req.Status = status
	}
	if popularity > 0 {
		req.Popularity = popularity
	}
	if ranking > 0 {
		req.Ranking = ranking
	}

	body, _ := json.Marshal(req)

	httpReq, err := http.NewRequest("PUT", a.BaseURL+"/admin/manga", bytes.NewBuffer(body))
	if err != nil {
		return err
	}

	httpReq.Header.Set("Authorization", "Bearer "+token)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed %s: %s", resp.Status, string(bodyBytes))
	}

	return nil
}

// UpdateMangaChapter updates manga chapter release (admin only)
func (a *AdminService) UpdateMangaChapter(mangaID string, chapter int) error {
	token, err := utils.LoadToken()
	if err != nil {
		return fmt.Errorf("not logged in")
	}

	req := UpdateChapterRequest{
		MangaID: mangaID,
		Chapter: chapter,
	}

	body, _ := json.Marshal(req)

	httpReq, err := http.NewRequest("PUT", a.BaseURL+"/admin/manga/chapter-release", bytes.NewBuffer(body))
	if err != nil {
		return err
	}

	httpReq.Header.Set("Authorization", "Bearer "+token)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed %s: %s", resp.Status, string(bodyBytes))
	}

	return nil
}
