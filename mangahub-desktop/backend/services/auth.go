package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"mangahub-desktop/backend/utils"
)

type AuthService struct {
	BaseURL string
}

func NewAuthService(baseURL string) *AuthService {
	return &AuthService{BaseURL: baseURL}
}

func (a *AuthService) Login(username, password string) error {
	req := map[string]string{
		"username": username,
		"password": password,
	}

	body, _ := json.Marshal(req)

	resp, err := http.Post(
		a.BaseURL+"/auth/login",
		"application/json",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("invalid username or password")
	}

	var result struct {
		Token string `json:"token"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return err
	}

	return utils.SaveToken(result.Token)
}

func (a *AuthService) Logout() error {
	return utils.ClearToken()
}
