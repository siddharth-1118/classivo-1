package handlers

import (
	"bytes"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
)

// HandleChatCompletion proxies requests from the frontend to the NVIDIA cloud API
func HandleChatCompletion(c *fiber.Ctx) error {
	apiKey := os.Getenv("NVIDIA_API_KEY")
	if apiKey == "" {
		log.Println("AI Proxy Error: NVIDIA_API_KEY is not configured in .env")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "AI service is currently unavailable (Missing API Key)",
		})
	}

	// Pass the raw request body directly to NVIDIA — no re-encoding
	req, err := http.NewRequest("POST", "https://integrate.api.nvidia.com/v1/chat/completions", bytes.NewReader(c.Body()))
	if err != nil {
		log.Printf("AI Proxy Error: Failed to create request: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to proxy request to AI service",
		})
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("AI Proxy Error: Network error contacting NVIDIA API: %v", err)
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"error": "Network error contacting AI service",
		})
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("AI Proxy Error: Failed to read response body: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to interpret AI response",
		})
	}

	c.Status(resp.StatusCode)
	c.Set("Content-Type", "application/json")
	return c.Send(respBody)
}
