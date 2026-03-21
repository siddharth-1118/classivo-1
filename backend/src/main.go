package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"goscraper/src/globals"
	"goscraper/src/handlers"
	"goscraper/src/handlers/chat"
	"goscraper/src/helpers/databases"
	"goscraper/src/scheduler"
	"goscraper/src/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cache"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/etag"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/websocket/v2"
	"github.com/joho/godotenv"
)

const (
	defaultPort = "7860"
	staticDir   = "../static"
	buildTag    = "v17-hostel-roommate-2026-03-21"
)

func main() {
	if globals.DevMode {
		if err := godotenv.Load(); err != nil {
			godotenv.Load("../.env")
		}
	}

	logEnvPresence()
	if _, err := databases.NewDatabaseHelper(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	scheduler.StartCronManager()

	port := os.Getenv("PORT")
	port = strings.TrimSpace(port)
	if port == "" {
		port = defaultPort
	}

	resolvedStaticDir := resolveStaticDir(staticDir)
	indexFile := filepath.Join(resolvedStaticDir, "admin.html")
	ensureStaticIndex(indexFile)

	app := fiber.New(fiber.Config{
		Prefork:      false,
		ServerHeader: "Backend",
		AppName:      "Classivo Backend v17",
		JSONEncoder:  json.Marshal,
		JSONDecoder:  json.Unmarshal,
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return utils.HandleError(c, err)
		},
	})

	app.Get("/", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"message": "Classivo API is Live 🚀",
			"status":  "running",
			"version": "v17-stable",
			"build":   buildTag,
		})
	})

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "ok",
			"service": "backend",
			"build":   buildTag,
		})
	})

	app.Use(func(c *fiber.Ctx) error {
		log.Printf("[REQUEST] %s %s", c.Method(), c.Path())
		return c.Next()
	})

	app.Use(recover.New())
	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed,
	}))
	app.Use(etag.New())

	corsOrigins := buildAllowedOrigins()
	app.Use(cors.New(cors.Config{
		AllowOrigins:     corsOrigins,
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,X-CSRF-Token,Authorization",
		ExposeHeaders:    "Content-Length",
		AllowCredentials: true,
	}))

	api := app.Group("/api")

	api.Use(limiter.New(limiter.Config{
		Max:        25,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			token := c.Get("X-CSRF-Token")
			if token != "" {
				return utils.Encode(token)
			}
			return c.IP()
		},
	}))

	// Initial Auth Middleware (CSRF)
	api.Use(func(c *fiber.Ctx) error {
		if isPublicRoute(c.Path()) {
			return c.Next()
		}

		rawToken := c.Get("X-CSRF-Token")
		if rawToken == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Missing X-CSRF-Token"})
		}

		if rawToken == "vss" {
			return c.Next()
		}

		parts := strings.Split(rawToken, ";")
		for i := range parts {
			parts[i] = strings.ReplaceAll(parts[i], " ", "")
		}
		sort.Strings(parts)
		token := strings.Join(parts, ";")

		hash := sha256.Sum256([]byte(token))
		hashStr := hex.EncodeToString(hash[:])

		if _, ok := globals.ActiveSessions.Load(hashStr); !ok {
			db, err := databases.NewDatabaseHelper()
			if err == nil {
				if exists, _ := db.VerifySession(hashStr); exists {
					globals.ActiveSessions.Store(hashStr, true)
					return c.Next()
				}
			}
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Session expired"})
		}

		return c.Next()
	})

	// Bearer Auth Middleware
	api.Use(func(c *fiber.Ctx) error {
		if isPublicRoute(c.Path()) {
			return c.Next()
		}
		if globals.DevMode {
			return c.Next()
		}

		auth := c.Get("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Missing Authorization header"})
		}

		rawToken := strings.TrimPrefix(auth, "Bearer ")
		parts := strings.Split(rawToken, ";")
		for i := range parts {
			parts[i] = strings.ReplaceAll(parts[i], " ", "")
		}
		sort.Strings(parts)
		token := strings.Join(parts, ";")

		hash := sha256.Sum256([]byte(token))
		hashStr := hex.EncodeToString(hash[:])

		if _, ok := globals.ActiveSessions.Load(hashStr); !ok {
			db, err := databases.NewDatabaseHelper()
			if err == nil {
				if exists, _ := db.VerifySession(hashStr); exists {
					globals.ActiveSessions.Store(hashStr, true)
					return c.Next()
				}
			}
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Session expired"})
		}

		return c.Next()
	})

	cacheConfig := cache.Config{
		Next: func(c *fiber.Ctx) bool {
			return c.Method() != "GET"
		},
		Expiration: 2 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.Path() + "_" + c.Get("X-CSRF-Token")
		},
	}

	// Routes
	api.Post("/login", func(c *fiber.Ctx) error {
		var creds struct {
			Username string  `json:"account"`
			Password string  `json:"password"`
			Cdigest  *string `json:"cdigest,omitempty"`
			Captcha  *string `json:"captcha,omitempty"`
		}
		if err := c.BodyParser(&creds); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
		}
		lf := &handlers.LoginFetcher{}
		session, err := lf.Login(creds.Username, creds.Password, creds.Cdigest, creds.Captcha)
		if err != nil {
			return err
		}
		if session != nil && session.Authenticated {
			go handlers.RecordLoginSuccess(creds.Username)
		}
		return c.JSON(session)
	})

	api.Get("/healthz", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "ok",
			"service": "api",
			"build":   buildTag,
		})
	})

	api.Delete("/logout", func(c *fiber.Ctx) error {
		lf := &handlers.LoginFetcher{}
		session, err := lf.Logout(c.Get("X-CSRF-Token"))
		if err != nil {
			return err
		}
		return c.JSON(session)
	})

	api.Get("/attendance", cache.New(cacheConfig), func(c *fiber.Ctx) error {
		token := c.Get("X-CSRF-Token")
		if token == "vss" {
			return c.JSON(fiber.Map{"attendance": []interface{}{}})
		}
		attendance, err := handlers.GetAttendance(token)
		if err != nil {
			return err
		}
		return c.JSON(attendance)
	})

	api.Get("/marks", cache.New(cacheConfig), func(c *fiber.Ctx) error {
		token := c.Get("X-CSRF-Token")
		if token == "vss" {
			return c.JSON(fiber.Map{"markList": []interface{}{}})
		}
		marks, err := handlers.GetMarks(token)
		if err != nil {
			return err
		}
		return c.JSON(marks)
	})

	api.Get("/courses", cache.New(cacheConfig), func(c *fiber.Ctx) error {
		token := c.Get("X-CSRF-Token")
		if token == "vss" {
			return c.JSON(fiber.Map{"courseList": []interface{}{}})
		}
		courses, err := handlers.GetCourses(token)
		if err != nil {
			return err
		}
		return c.JSON(courses)
	})

	api.Get("/profile", cache.New(cacheConfig), func(c *fiber.Ctx) error {
		token := c.Get("X-CSRF-Token")
		if token == "vss" {
			return c.JSON(fiber.Map{"name": "vss", "section": "ADMIN", "regNumber": "ADMIN"})
		}
		user, err := handlers.GetUser(token)
		if err != nil {
			return err
		}
		return c.JSON(user)
	})

	api.Get("/timetable", cache.New(cacheConfig), func(c *fiber.Ctx) error {
		token := c.Get("X-CSRF-Token")
		if token == "vss" {
			return c.JSON(fiber.Map{"schedule": []interface{}{}})
		}
		tt, err := handlers.GetTimetable(token)
		if err != nil {
			return err
		}
		return c.JSON(tt)
	})

	api.Get("/calendar", cache.New(cacheConfig), func(c *fiber.Ctx) error {
		db, err := databases.NewCalDBHelper()
		if err != nil {
			return err
		}
		dbcal, err := db.GetEvents()
		if err == nil && len(dbcal.Calendar) > 0 {
			return c.JSON(dbcal)
		}
		cal, err := handlers.GetCalendar(c.Get("X-CSRF-Token"))
		if err == nil {
			go func() {
				for _, event := range cal.Calendar {
					for _, month := range event.Days {
						db.SetEvent(databases.CalendarEvent{
							ID:    utils.GenerateID(),
							Date:  month.Date,
							Month: event.Month,
							Day:   month.Day,
							Order: month.DayOrder,
							Event: month.Event,
						})
					}
				}
			}()
		}
		return c.JSON(cal)
	})

	api.Get("/get", cache.New(cacheConfig), func(c *fiber.Ctx) error {
		token := c.Get("X-CSRF-Token")
		if token == "vss" {
			return c.JSON(fiber.Map{"user": fiber.Map{"name": "Admin"}})
		}
		encodedToken := utils.Encode(token)
		db, err := databases.NewDatabaseHelper()
		if err == nil {
			cached, _ := db.FindByToken("goscrape", encodedToken)
			if len(cached) > 0 {
				return c.JSON(cached)
			}
		}
		data, err := fetchAllData(token)
		if err == nil && data != nil {
			data["token"] = encodedToken
			db.UpsertData("goscrape", data)
		}
		return c.JSON(data)
	})

	api.Get("/rooms", func(c *fiber.Ctx) error {
		return c.JSON(chat.GlobalHub.GetActiveRooms())
	})

	api.Post("/payment/link", func(c *fiber.Ctx) error {
		var payload handlers.PaymentLinkRequest
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid payload"})
		}
		link, err := handlers.CreatePaymentLink(payload)
		if err != nil {
			return err
		}
		return c.JSON(fiber.Map{"shortUrl": link})
	})

	api.Post("/ai/chat", func(c *fiber.Ctx) error {
		return handlers.HandleChatCompletion(c)
	})

	api.Post("/queries", handlers.HandleSubmitQuery)
	api.Get("/notes", handlers.HandleListNotes)
	api.Post("/notes/upload", handlers.HandleUploadNote)
	api.Get("/community/posts", handlers.HandleListCommunityPosts)
	api.Post("/community/posts", handlers.HandleCreateCommunityPost)
	api.Get("/community/posts/:id/replies", handlers.HandleListCommunityReplies)
	api.Post("/community/posts/:id/replies", handlers.HandleCreateCommunityReply)
	api.Post("/community/reports", handlers.HandleReportContent)
	api.Get("/faculty-reviews", handlers.HandleListFacultyReviews)
	api.Post("/faculty-reviews", handlers.HandleCreateFacultyReview)
	api.Get("/events", handlers.HandleListEvents)
	api.Get("/hostel-roommate", handlers.HandleGetHostelRoommate)
	api.Post("/hostel-roommate", handlers.HandleUpsertHostelRoommate)
	api.Get("/hostel-rrommate", handlers.HandleGetHostelRoommate)
	api.Post("/hostel-rrommate", handlers.HandleUpsertHostelRoommate)
	api.Post("/admin/analytics", handlers.HandleGetAnalytics)
	api.Post("/admin/queries", handlers.HandleGetQueries)
	api.Post("/admin/moderation", handlers.HandleGetModeration)
	api.Post("/admin/notes/:id/approve", handlers.HandleApproveNote)
	api.Post("/admin/notes/:id/reject", handlers.HandleRejectNote)
	api.Post("/admin/reports/:id/dismiss", handlers.HandleDismissReport)
	api.Post("/admin/reports/:id/remove", handlers.HandleRemoveReportedContent)
	api.Post("/admin/events", handlers.HandleCreateEvent)
	api.Delete("/admin/events/:id", handlers.HandleDeleteEvent)
	api.Post("/analytics/pageview", handlers.HandleTrackPageView)
	api.Post("/notifications/subscribe", handlers.HandleSaveSubscription)

	api.Get("/chat", func(c *fiber.Ctx) error {
		if !websocket.IsWebSocketUpgrade(c) {
			return c.SendStatus(fiber.StatusUpgradeRequired)
		}

		token := c.Query("token")
		
		// Log to file for persistent debugging
		f, _ := os.OpenFile("c:/Vertex/backend/ws_debug.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if f != nil {
			defer f.Close()
			fmt.Fprintf(f, "[%s] %s %s | Upgrade: %v | Token len: %d\n", 
				time.Now().Format("15:04:05"), c.Method(), c.Path(), websocket.IsWebSocketUpgrade(c), len(token))
		}

		// Clean and normalize token for hashing
		parts := strings.Split(token, ";")
		for i := range parts {
			parts[i] = strings.ReplaceAll(parts[i], " ", "")
		}
		sort.Strings(parts)
		cleanToken := strings.Join(parts, ";")

		hash := sha256.Sum256([]byte(cleanToken))
		hashStr := hex.EncodeToString(hash[:])

		if f != nil {
			fmt.Fprintf(f, "[%s] Calculated Hash: %s\n", time.Now().Format("15:04:05"), hashStr)
		}

		if _, ok := globals.ActiveSessions.Load(hashStr); ok {
			if f != nil { fmt.Fprintf(f, "[%s] Memory match found!\n", time.Now().Format("15:04:05")) }
			return websocket.New(chat.ChatWebsocket)(c)
		}

		db, err := databases.NewDatabaseHelper()
		if err == nil {
			if exists, _ := db.VerifySession(hashStr); exists {
				if f != nil { fmt.Fprintf(f, "[%s] Supabase match found! Recovering.\n", time.Now().Format("15:04:05")) }
				globals.ActiveSessions.Store(hashStr, true)
				return websocket.New(chat.ChatWebsocket)(c)
			}
		}

		if f != nil { fmt.Fprintf(f, "[%s] AUTH REJECTED: Hash not found in Memory or Supabase.\n", time.Now().Format("15:04:05")) }
		log.Printf("[WS AUTH FAIL] Hash not found: %s", hashStr)
		return fiber.ErrUnauthorized
	})

	// SPA Fallback
	app.Use(func(c *fiber.Ctx) error {
		if strings.HasPrefix(c.Path(), "/api") {
			return c.Next()
		}
		if c.Method() != fiber.MethodGet {
			return c.Next()
		}
		return c.SendFile(indexFile)
	})

	log.Printf("Serving static from %s", resolvedStaticDir)
	app.Static("/", resolvedStaticDir)

	log.Printf("Starting on :%s | build=%s", port, buildTag)
	if err := app.Listen(":" + port); err != nil {
		log.Printf("Fiber listen failed on :%s: %v", port, err)
	}
}

func buildAllowedOrigins() string {
	origins := []string{"http://localhost:7860"}
	if globals.DevMode {
		origins = append(origins, "http://localhost:3000", "http://localhost:243", "http://127.0.0.1:3000", "http://127.0.0.1:7860")
	}
	appendOrigin := func(value string) {
		value = strings.TrimSpace(value)
		if value != "" {
			origins = append(origins, value)
		}
	}
	if url := os.Getenv("URL"); url != "" {
		appendOrigin(url)
	}
	if frontend := os.Getenv("FRONTEND_ORIGIN"); frontend != "" {
		appendOrigin(frontend)
	}
	if vercel := os.Getenv("VERCEL_DEPLOYMENT_URL"); vercel != "" {
		if !strings.HasPrefix(vercel, "http") {
			vercel = "https://" + vercel
		}
		appendOrigin(vercel)
	}
	if extras := os.Getenv("CORS_EXTRA_ORIGINS"); extras != "" {
		for _, origin := range strings.Split(extras, ",") {
			appendOrigin(origin)
		}
	}
	seen := make(map[string]struct{})
	result := make([]string, 0, len(origins))
	for _, origin := range origins {
		origin = strings.TrimSpace(origin)
		if origin == "" {
			continue
		}
		if _, ok := seen[origin]; ok {
			continue
		}
		seen[origin] = struct{}{}
		result = append(result, origin)
	}
	return strings.Join(result, ",")
}


func fetchAllData(token string) (map[string]interface{}, error) {
	resultChan := make(chan struct {
		key  string
		data interface{}
		err  error
	}, 5)

	go func() {
		d, e := handlers.GetUser(token)
		resultChan <- struct {
			key  string
			data interface{}
			err  error
		}{"user", d, e}
	}()
	go func() {
		d, e := handlers.GetAttendance(token)
		resultChan <- struct {
			key  string
			data interface{}
			err  error
		}{"attendance", d, e}
	}()
	go func() {
		d, e := handlers.GetMarks(token)
		resultChan <- struct {
			key  string
			data interface{}
			err  error
		}{"marks", d, e}
	}()
	go func() {
		d, e := handlers.GetCourses(token)
		resultChan <- struct {
			key  string
			data interface{}
			err  error
		}{"courses", d, e}
	}()
	go func() {
		d, e := handlers.GetTimetable(token)
		resultChan <- struct {
			key  string
			data interface{}
			err  error
		}{"timetable", d, e}
	}()

	data := make(map[string]interface{})
	for i := 0; i < 5; i++ {
		r := <-resultChan
		if r.err != nil {
			return nil, r.err
		}
		data[r.key] = r.data
	}
	return data, nil
}

func isPublicRoute(path string) bool {
	path = strings.TrimSuffix(path, "/")
	switch path {
	case "/api/login", "/api/healthz", "/api/logout", "/api/ai/chat", "/api/chat", "/api/analytics/pageview", "/api/admin/analytics", "/api/admin/queries", "/api/admin/moderation", "/api/admin/events":
		return true
	default:
		if strings.HasPrefix(path, "/api/admin/notes/") || strings.HasPrefix(path, "/api/admin/reports/") || strings.HasPrefix(path, "/api/admin/events/") {
			return true
		}
		return false
	}
}

func logEnvPresence() {
	required := []string{"SUPABASE_URL", "SUPABASE_ANON_KEY"}
	for _, key := range required {
		if os.Getenv(key) == "" {
			log.Printf("[WARN] %s not set", key)
		}
	}
}

func ensureStaticIndex(indexPath string) {
	if _, err := os.Stat(indexPath); err != nil {
		log.Printf("[WARN] %s missing", indexPath)
	}
}

func resolveStaticDir(configured string) string {
	if _, err := os.Stat(configured); err == nil {
		return configured
	}
	return "./static"
}
