package utils

import (
	"fmt"
	"os"
	"path/filepath"
	"time"
)

var logFile *os.File

// InitLogger initializes the log file
func InitLogger() error {
	// Get user's home directory
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	// Create logs directory in user's home
	logDir := filepath.Join(homeDir, "mangahub-logs")
	if err := os.MkdirAll(logDir, 0755); err != nil {
		return err
	}

	// Create log file with timestamp
	logPath := filepath.Join(logDir, fmt.Sprintf("chat-%s.log", time.Now().Format("2006-01-02")))

	logFile, err = os.OpenFile(logPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}

	LogInfo("Logger initialized at: " + logPath)
	return nil
}

// CloseLogger closes the log file
func CloseLogger() {
	if logFile != nil {
		logFile.Close()
	}
}

// LogInfo logs an info message
func LogInfo(msg string) {
	log(fmt.Sprintf("[INFO] %s", msg))
}

// LogError logs an error message
func LogError(msg string) {
	log(fmt.Sprintf("[ERROR] %s", msg))
}

// LogDebug logs a debug message
func LogDebug(msg string) {
	log(fmt.Sprintf("[DEBUG] %s", msg))
}

func log(msg string) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	logLine := fmt.Sprintf("[%s] %s\n", timestamp, msg)

	// Print to console
	fmt.Print(logLine)

	// Write to file
	if logFile != nil {
		logFile.WriteString(logLine)
	}
}
