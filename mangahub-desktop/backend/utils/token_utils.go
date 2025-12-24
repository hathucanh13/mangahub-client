package utils

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte(os.Getenv("JWT_SECRET"))

type SignedDetails struct {
	UserId   int64
	Username string
	Role     string
	jwt.RegisteredClaims
}

func GenerateJWT(userID int64, username string, role string) (string, error) {
	claims := &SignedDetails{
		UserId:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "MangaHub",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

// return signedToken, nil

func ValidateToken(tokenString string) (*SignedDetails, error) {
	claims := &SignedDetails{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(jwtKey), nil
	})
	if err != nil {
		return nil, err
	}

	//security check
	if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
		return nil, errors.New("unexpected signing method")
	}

	if claims.ExpiresAt.Time.Before(time.Now()) {
		return nil, errors.New("token expired")
	}

	return claims, nil
}

func tokenFilePath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".mangahub-desktop", "token"), nil
}

func SaveToken(token string) error {
	path, err := tokenFilePath()
	if err != nil {
		return err
	}

	// ensure folder exists
	os.MkdirAll(filepath.Dir(path), 0700)

	return os.WriteFile(path, []byte(token), 0600)
}

func LoadToken() (string, error) {
	path, err := tokenFilePath()
	if err != nil {
		return "", err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}

	return string(data), nil
}

func ClearToken() error {
	path, err := tokenFilePath()
	if err != nil {
		return err
	}
	return os.Remove(path)
}

func DeviceID() string {
	return fmt.Sprintf("device-%d", time.Now().UnixNano())
}
