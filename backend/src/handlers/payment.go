package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"
)

type PaymentLinkRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Contact string `json:"contact"`
}

type paymentLinkResponse struct {
	ShortURL string `json:"short_url"`
	Error    string `json:"error"`
}

func CreatePaymentLink(req PaymentLinkRequest) (string, error) {
	key := os.Getenv("RAZORPAY_KEY_ID")
	secret := os.Getenv("RAZORPAY_KEY_SECRET")
	if key == "" || secret == "" {
		return "", errors.New("razorpay credentials are missing")
	}

	callbackURL := os.Getenv("PAYMENT_CALLBACK_URL")
	if callbackURL == "" {
		callbackURL = "https://Classivo123.vercel.app/app/dashboard"
	}

	amount := 2000
	if raw := os.Getenv("PAYMENT_AMOUNT"); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil {
			amount = parsed
		}
	}

	payload := map[string]interface{}{
		"upi_link":       true,
		"amount":         amount,
		"currency":       "INR",
		"accept_partial": false,
		"description":    "Classivo Subscription",
		"customer": map[string]string{
			"name":    req.Name,
			"contact": req.Contact,
			"email":   req.Email,
		},
		"callback_url":    callbackURL,
		"callback_method": "get",
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	httpReq, err := http.NewRequest(http.MethodPost, "https://api.razorpay.com/v1/payment_links", bytes.NewBuffer(body))
	if err != nil {
		return "", err
	}
	httpReq.SetBasicAuth(key, secret)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var parsed paymentLinkResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return "", err
	}

	if resp.StatusCode >= http.StatusBadRequest {
		if parsed.Error != "" {
			return "", fmt.Errorf("razorpay error: %s", parsed.Error)
		}
		return "", fmt.Errorf("razorpay request failed with status %d", resp.StatusCode)
	}

	if parsed.ShortURL == "" {
		return "", errors.New("short_url missing in Razorpay response")
	}

	return parsed.ShortURL, nil
}

