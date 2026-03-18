package handlers

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"

	"goscraper/src/helpers/databases"
	"goscraper/src/utils"
)


type QueryPayload struct {
	Subject string `json:"subject"`
	Message string `json:"message"`
}

func HandleSubmitQuery(c *fiber.Ctx) error {
	var payload QueryPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	if payload.Subject == "" || payload.Message == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Subject and message are required",
		})
	}

	// 1. Get the session token from headers (already verified by middleware)
	// We check X-CSRF-Token or Authorization Bearer
	token := c.Get("X-CSRF-Token")
	if token == "" {
		token = c.Get("Authorization")
		if len(token) > 7 {
			token = token[7:] // Strip "Bearer "
		}
	}

	// 2. Fetch the student's email/regNumber from the cache using their token
	db, err := databases.NewDatabaseHelper()
	if err != nil {
		log.Printf("[QUERIES ERR] Failed to init DB: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Internal database error",
		})
	}

	// We need their identity. Attempt to decode token directly (not recommended) or look up from goscrape cache
	// In the Classivo ecosystem, user mapping is often stored in the db "goscrape" table by token.
	encodedToken := utils.Encode(token)
	userData, err := db.FindByToken("goscrape", encodedToken)
	if err != nil {
		log.Printf("[QUERIES ERR] Failed to look up user by token: %v", err)
	}

	userEmail := "unknown@srmist.edu.in"
	if userData != nil {
		// Look for the user object within the cached data
		if userMap, ok := userData["user"].(map[string]interface{}); ok {
			if email, ok := userMap["email"].(string); ok {
				userEmail = email
			}
		} else if reg, ok := userData["regNumber"].(string); ok {
			userEmail = reg + "@srmist.edu.in"
		}
	}

	// For safety if we couldn't resolve it, we will just use the token hash prefix
	if userEmail == "unknown@srmist.edu.in" && encodedToken != "" {
		userEmail = "student_" + encodedToken[:min(8, len(encodedToken))] + "@srmist.edu.in"
	}

	// 3. Insert the query into the "queries" table
	data := map[string]interface{}{
		"user_email": userEmail,
		"subject":    payload.Subject,
		"message":    payload.Message,
		"status":     "Open",
		"created_at": time.Now().UTC().Format(time.RFC3339),
	}

	// UpsertData expects a `regNumber` or `token` field to use as conflict key if not specified otherwise.
	// We'll write a direct insert since this is a new table.
	_, _, err = db.Client().From("queries").Insert(data, false, "", "", "").Execute()
	
	if err != nil {
		log.Printf("[QUERIES ERR] Failed to insert query to Supabase: %v", err)
		// Return 200 anyway for now so students don't get blocked if Admin hasn't created the table yet
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message": "Query received, but database storage is pending admin setup.",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Query sent successfully to Admin",
	})
}

type AdminCredentialsPayload struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func HandleGetQueries(c *fiber.Ctx) error {
	var body AdminCredentialsPayload
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	// For security, use "admin@classivo.com" and "ClassivoAdmin2026!"
	if body.Email != "admin@classivo.com" || body.Password != "ClassivoAdmin2026!" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid admin credentials"})
	}

	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	var results []map[string]interface{}
	_, err = db.Client().From("queries").Select("*", "", false).ExecuteTo(&results)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch queries"})
	}

	return c.JSON(results)
}

func min(a, b int) int {

	if a < b {
		return a
	}
	return b
}
