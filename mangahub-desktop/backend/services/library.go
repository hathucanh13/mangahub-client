package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

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
