package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"mangahub-desktop/backend/models"
	"mangahub-desktop/backend/utils"
)

type LibraryService struct {
	BaseURL string
}

func NewLibraryService(baseURL string) *LibraryService {
	return &LibraryService{BaseURL: baseURL}
}

func (l *LibraryService) List() (*models.ReadingLists, error) {
	jwt, _ := utils.LoadToken()
	if jwt == "" {
		return nil, fmt.Errorf("not logged in")
	}

	req, _ := http.NewRequest("GET", l.BaseURL+"/users/library", nil)
	req.Header.Set("Authorization", "Bearer "+jwt)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf(string(b))
	}

	var list models.ReadingLists
	err = json.NewDecoder(resp.Body).Decode(&list)
	return &list, err
}

func (l *LibraryService) Add(mangaID, status string, chapter int) error {
	jwt, _ := utils.LoadToken()
	if jwt == "" {
		return fmt.Errorf("not logged in")
	}

	reqBody := map[string]interface{}{
		"manga_id": mangaID,
		"status":   status,
	}

	if chapter > 0 {
		reqBody["current_chapter"] = chapter
	}

	body, _ := json.Marshal(reqBody)

	req, _ := http.NewRequest(
		"POST",
		l.BaseURL+"/users/library",
		bytes.NewBuffer(body),
	)

	req.Header.Set("Authorization", "Bearer "+jwt)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf(string(b))
	}

	return nil
}
