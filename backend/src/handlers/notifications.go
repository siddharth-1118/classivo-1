package handlers

import (
	"log"

	"github.com/gofiber/fiber/v2"

	"goscraper/src/helpers/databases"
	"goscraper/src/utils"
)

type Keys struct {
	P256dh string `json:"p256dh"`
	Auth   string `json:"auth"`
}

type PushSubscription struct {
	Endpoint string `json:"endpoint"`
	Keys     Keys   `json:"keys"`
}

func HandleSaveSubscription(c *fiber.Ctx) error {
	var sub PushSubscription
	if err := c.BodyParser(&sub); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid subscription payload"})
	}

	if sub.Endpoint == "" || sub.Keys.P256dh == "" || sub.Keys.Auth == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Incomplete subscription data"})
	}

	token := c.Get("X-CSRF-Token")
	if token == "" {
		token = c.Get("Authorization")
		if len(token) > 7 {
			token = token[7:]
		}
	}

	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	encodedToken := utils.Encode(token)
	userData, err := db.FindByToken("goscrape", encodedToken)
	
	userEmail := "unknown@srmist.edu.in"
	if userData != nil {
		if userMap, ok := userData["user"].(map[string]interface{}); ok {
			if email, ok := userMap["email"].(string); ok {
				userEmail = email
			}
		} else if reg, ok := userData["regNumber"].(string); ok {
			userEmail = reg + "@srmist.edu.in"
		}
	}

	if userEmail == "unknown@srmist.edu.in" && encodedToken != "" {
		userEmail = "student_" + encodedToken[:min(8, len(encodedToken))] + "@srmist.edu.in"
	}

	data := map[string]interface{}{
		"user_email": userEmail,
		"endpoint":   sub.Endpoint,
		"p256dh":     sub.Keys.P256dh,
		"auth":       sub.Keys.Auth,
	}

	// Insert into Supabase `subscriptions` table. Upsert on endpoint if it already exists.
	_, _, err = db.Client().From("subscriptions").Upsert(data, "endpoint", "", "").Execute()
	if err != nil {
		log.Printf("[PUSH ERR] Failed to save subscription: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save subscription"})
	}

	log.Printf("[PUSH] Saved new subscription for %s", userEmail)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Subscription saved successfully"})
}
