package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"mangahub-desktop/backend/models"
)

type MangaService struct {
	BaseURL string
}

func NewMangaService(baseURL string) *MangaService {
	return &MangaService{BaseURL: baseURL}
}

func (l *MangaService) ListAllMangas(mangaID string) ([]models.Manga, error) {
	var url string

	url = l.BaseURL + "/manga"

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed %s: %s", resp.Status, string(body))
	}

	if mangaID != "" {
		var m interface{}
		if err := json.NewDecoder(resp.Body).Decode(&m); err != nil {
			return nil, err
		}

		raw, err := json.Marshal(m)
		if err != nil {
			return nil, err
		}
		fmt.Println(string(raw))
		return nil, nil
	}

	var mangas []models.Manga
	if err := json.NewDecoder(resp.Body).Decode(&mangas); err != nil {
		return nil, err
	}

	fmt.Println("📚 Manga List:")
	if len(mangas) == 0 {
		fmt.Println("No manga found.")
		return nil, nil
	}

	for _, m := range mangas {
		fmt.Printf(" - %s (%s)\n", m.Title, m.ID)
	}

	return mangas, nil
}

// func (l *LibraryService) Add(mangaID, status string, chapter int) error {
// 	jwt, _ := utils.LoadToken()
// 	if jwt == "" {
// 		return fmt.Errorf("not logged in")
// 	}

// 	reqBody := map[string]interface{}{
// 		"manga_id": mangaID,
// 		"status":   status,
// 	}

// 	if chapter > 0 {
// 		reqBody["current_chapter"] = chapter
// 	}

// 	body, _ := json.Marshal(reqBody)

// 	req, _ := http.NewRequest(
// 		"POST",
// 		l.BaseURL+"/users/library",
// 		bytes.NewBuffer(body),
// 	)

// 	req.Header.Set("Authorization", "Bearer "+jwt)
// 	req.Header.Set("Content-Type", "application/json")

// 	resp, err := http.DefaultClient.Do(req)
// 	if err != nil {
// 		return err
// 	}
// 	defer resp.Body.Close()

// 	if resp.StatusCode >= 300 {
// 		b, _ := io.ReadAll(resp.Body)
// 		return fmt.Errorf(string(b))
// 	}

// 	return nil
// }
