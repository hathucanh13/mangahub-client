package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"mangahub-desktop/backend/models"
	"mangahub-desktop/backend/utils"
)

type LibraryService struct {
	BaseURL string
}

func NewLibraryService(baseURL string) *LibraryService {
	return &LibraryService{BaseURL: baseURL}
}

func authRequest(method, url string, body io.Reader) (*http.Request, error) {
	jwt, _ := utils.LoadToken()
	if jwt == "" {
		return nil, fmt.Errorf("not logged in")
	}

	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+jwt)
	req.Header.Set("Content-Type", "application/json")
	return req, nil
}

type ProgressUpdateRequest struct {
	MangaID        string  `json:"manga_id"`
	CurrentChapter int     `json:"current_chapter"`
	Volume         *int    `json:"volume,omitempty"`
	Notes          *string `json:"notes,omitempty"`
	Force          bool    `json:"force"`
}

type ProgressUpdateResponse struct {
	MangaTitle        string    `json:"manga_title"`
	PreviousChapter   int       `json:"previous_chapter"`
	CurrentChapter    int       `json:"current_chapter"`
	UpdatedAt         time.Time `json:"updated_at"`
	DevicesSynced     int       `json:"devices_synced"`
	TotalChaptersRead int       `json:"total_chapters_read"`
	ReadingStreak     int       `json:"reading_streak"`
	NextChapter       int       `json:"next_chapter"`
}

func (l *LibraryService) UpdateProgress(mangaID string, chapter int, volume *int, notes *string, force bool) (*ProgressUpdateResponse, error) {
	// jwt := s.config.GetToken()
	// if jwt == "" {
	//     return nil, fmt.Errorf("not authenticated")
	// }

	reqBody := ProgressUpdateRequest{
		MangaID:        mangaID,
		CurrentChapter: chapter,
		Volume:         volume,
		Notes:          notes,
		Force:          force,
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := authRequest(
		"PATCH",
		l.BaseURL+"/users/progress",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		errBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("progress update failed: %s", strings.TrimSpace(string(errBody)))
	}

	var result ProgressUpdateResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

// LIST
func (l *LibraryService) List(status string) (*models.ReadingLists, error) {
	u, _ := url.Parse(l.BaseURL + "/users/library")
	if status != "" {
		q := u.Query()
		q.Set("status", status)
		u.RawQuery = q.Encode()
	}

	req, err := authRequest("GET", u.String(), nil)
	if err != nil {
		return nil, err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf(string(b))
	}

	var list models.ReadingLists
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}

	return &list, nil
}

// ADD
func (l *LibraryService) Add(mangaID, status string, chapter *int) error {
	if mangaID == "" {
		return fmt.Errorf("manga_id required")
	}
	if status == "" {
		status = "plan_to_read"
	}

	reqBody := map[string]interface{}{
		"manga_id": mangaID,
		"status":   status,
	}

	if chapter != nil {
		reqBody["current_chapter"] = *chapter
	}

	body, _ := json.Marshal(reqBody)

	req, err := authRequest(
		"POST",
		l.BaseURL+"/users/library",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("add failed: %s", string(b))
	}

	return nil
}

// UPDATE
func (l *LibraryService) Update(mangaID, status string) error {
	if mangaID == "" || status == "" {
		return fmt.Errorf("manga_id and status required")
	}

	reqBody := map[string]string{
		"manga_id": mangaID,
		"status":   status,
	}

	body, _ := json.Marshal(reqBody)

	req, err := authRequest(
		"PATCH",
		l.BaseURL+"/users/library",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("update failed: %s", string(b))
	}

	return nil
}

// REMOVE
func (l *LibraryService) Remove(mangaID string) error {
	if mangaID == "" {
		return fmt.Errorf("manga_id required")
	}

	reqBody := map[string]string{
		"manga_id": mangaID,
	}

	body, _ := json.Marshal(reqBody)

	req, err := authRequest(
		"DELETE",
		l.BaseURL+"/users/library",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("remove failed: %s", string(b))
	}

	return nil
}

func (l *LibraryService) SyncProgress() error {
	jwt, err := utils.LoadToken()
	if err != nil || jwt == "" {
		return fmt.Errorf("not authenticated")
	}

	url := l.BaseURL + "/users/progress/sync"

	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+jwt)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("sync failed: %s", string(body))
	}

	return nil
}

// GetSyncStatus checks the current sync status
func (l *LibraryService) GetSyncStatus() (map[string]string, error) {
	jwt, err := utils.LoadToken()
	if err != nil || jwt == "" {
		return nil, fmt.Errorf("not authenticated")
	}

	url := l.BaseURL + "/users/progress/sync-status"

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+jwt)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed: %s", string(body))
	}

	var result map[string]string
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return result, nil
}

type ProgressHistoryItem struct {
	MangaID string `json:"manga_id"`
	Chapter int    `json:"chapter"`
	Date    string `json:"date_read"`
}

type ProgressHistory struct {
	UserID  int64                 `json:"user_id"`
	History []ProgressHistoryItem `json:"history"`
}

// GetProgressHistory fetches reading progress history
func (l *LibraryService) GetProgressHistory(mangaID string) (*ProgressHistory, error) {
	jwt, err := utils.LoadToken()
	if err != nil || jwt == "" {
		return nil, fmt.Errorf("not authenticated")
	}

	url := l.BaseURL + "/users/progress/history"
	fmt.Println("URL:", url)
	if mangaID != "" {
		url += "?manga_id=" + mangaID
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+jwt)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed: %s", string(body))
	}

	var result ProgressHistory
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}
