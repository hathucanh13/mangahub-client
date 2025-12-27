package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"mangahub-desktop/backend/utils"
)

type AuthService struct {
	BaseURL        string
	OnLoginSuccess func() error // Callback to initialize services after login
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

	if err := utils.SaveToken(result.Token); err != nil {
		return err
	}

	// Initialize services after successful login
	if a.OnLoginSuccess != nil {
		if err := a.OnLoginSuccess(); err != nil {
			log.Printf("Failed to initialize services after login: %v", err)
			// Don't fail login if service initialization fails
		}
	}

	return nil
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

func (a *AuthService) IsAdmin() (bool, error) {
	token, err := utils.LoadToken()
	if err != nil {
		return false, err
	}

	claims, err := utils.ValidateToken(token)
	if err != nil {
		return false, err
	}

	return claims.Role == "admin", nil
}
