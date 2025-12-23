package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
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
func (a *AuthService) Signup(username, password string) error {
	req := map[string]string{
		"username": username,
		"password": password,
	}

	body, _ := json.Marshal(req)

	resp, err := http.Post(
		a.BaseURL+"/auth/signup",
		"application/json",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if err != nil {
		return err
	}

	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf(string(b))
	}

	return nil
}

func (a *AuthService) Logout() error {
	return utils.ClearToken()
}

func (a *AuthService) GetCurrentUsername() (string, error) {
	token, err := utils.LoadToken()
	if err != nil {
		return "", err
	}

	claims, err := utils.ValidateToken(token)
	if err != nil {
		return "", err
	}

	return claims.Username, nil
}
