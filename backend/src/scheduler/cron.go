package scheduler

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	webpush "github.com/SherClockHolmes/webpush-go"
	"github.com/gofiber/fiber/v2"
	"github.com/robfig/cron/v3"

	"goscraper/src/helpers/databases"
)

var (
	vapidPublicKey  = os.Getenv("VAPID_PUBLIC_KEY")
	vapidPrivateKey = os.Getenv("VAPID_PRIVATE_KEY")
)

type MessMenu map[string]map[string][]string

// Read from frontend/public/mess_menu.json
func loadMenu() (MessMenu, error) {
	bytes, err := os.ReadFile("../frontend/public/mess_menu.json")
	if err != nil {
		return nil, err
	}
	var menu MessMenu
	if err := json.Unmarshal(bytes, &menu); err != nil {
		return nil, err
	}
	return menu, nil
}

func SendPushToAll(title, body string) {
	db, err := databases.NewDatabaseHelper()
	if err != nil {
		log.Println("[CRON ERR] Failed to connect to DB:", err)
		return
	}

	var subscriptions []map[string]interface{}
	_, err = db.Client().From("subscriptions").Select("*", "", false).ExecuteTo(&subscriptions)
	
	if err != nil || len(subscriptions) == 0 {
		return // No subscribers or error
	}

	payload := []byte(fmt.Sprintf(`{"title": "%s", "body": "%s"}`, title, body))

	success := 0
	for _, sub := range subscriptions {
		var subObj webpush.Subscription
		// Adjust map to match webpush structure so json unmarshal works
		keysObj := map[string]string{
			"p256dh": sub["p256dh"].(string),
			"auth":   sub["auth"].(string),
		}
		endpoint := sub["endpoint"].(string)

		subObj.Endpoint = endpoint
		subObj.Keys.P256dh = keysObj["p256dh"]
		subObj.Keys.Auth = keysObj["auth"]

		resp, err := webpush.SendNotification(payload, &subObj, &webpush.Options{
			Subscriber:      "mailto:admin@classivo.com",
			VAPIDPublicKey:  vapidPublicKey,
			VAPIDPrivateKey: vapidPrivateKey,
			TTL:             43200, // 12 hours
		})

		if err != nil {
			// If subscription is invalid (410 gone), we should delete it, but skipping for brevity
			continue
		}
		defer resp.Body.Close()
		success++
	}

	log.Printf("[CRON] Menu Push Notification Sent. Success: %d/%d", success, len(subscriptions))
}

func triggerMenuNotification(mealType string) {
	if vapidPrivateKey == "" {
		log.Println("[CRON ERR] VAPID keys not set. Skipping push.")
		return
	}

	istLoc, _ := time.LoadLocation("Asia/Kolkata")
	now := time.Now().In(istLoc)
	todayStr := now.Format("Monday")

	menu, err := loadMenu()
	if err != nil {
		log.Println("[CRON ERR] Failed to load mess menu:", err)
		return
	}

	items := menu[todayStr][mealType]
	if len(items) == 0 {
		return
	}

	// Make a summary string (e.g., "Bread, Jam, Dosa...")
	summary := strings.Join(items, ", ")
	if len(summary) > 100 {
		summary = summary[:97] + "..."
	}

	title := fmt.Sprintf("🍽 %s Menu (%s)", mealType, todayStr)
	body := fmt.Sprintf("Today's %s is starting in 1 hour. Menu: %s", mealType, summary)

	SendPushToAll(title, body)
}

func HandleTestPush(c *fiber.Ctx) error {
	SendPushToAll("Test Push", "This is a test notification from the Classivo backend.")
	return c.JSON(fiber.Map{"message": "Test push initiated"})
}

func StartCronManager() {
	istLoc, err := time.LoadLocation("Asia/Kolkata")
	if err != nil {
		log.Println("[CRON ERR] Failed to load IST timezone", err)
		return
	}

	c := cron.New(cron.WithLocation(istLoc))

	// Breakfast at 7am -> Notify at 6am (0 6 * * *)
	c.AddFunc("0 6 * * *", func() { triggerMenuNotification("Breakfast") })

	// Lunch at 11:30am -> Notify at 10:30am (30 10 * * *)
	c.AddFunc("30 10 * * *", func() { triggerMenuNotification("Lunch") })

	// Snacks at 4:30pm -> Notify at 3:30pm (30 15 * * *)
	c.AddFunc("30 15 * * *", func() { triggerMenuNotification("Snacks") })

	// Dinner at 7pm -> Notify at 6pm (0 18 * * *)
	c.AddFunc("0 18 * * *", func() { triggerMenuNotification("Dinner") })

	c.Start()
	log.Println("[CRON] Push Notification Scheduler running in Asia/Kolkata timezone")
}
