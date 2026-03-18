package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"log"
	"net"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"goscraper/src/globals"
	"goscraper/src/handlers"
	"goscraper/src/helpers/databases"
	"goscraper/src/scheduler"
	"goscraper/src/types"
	"goscraper/src/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cache"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/etag"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

const (
	defaultPort = "7860"
	staticDir   = "../static"
)

func main() {
	if globals.DevMode {
		// Try current dir first, then parent (src/ -> backend/)
		if err := godotenv.Load(); err != nil {
			godotenv.Load("../.env")
		}
	}

	logEnvPresence()
	scheduler.StartCronManager()

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
		log.Printf("PORT not set. Falling back to %s", defaultPort)
	} else {
		log.Printf("Using configured PORT=%s", port)
	}

	resolvedStaticDir := resolveStaticDir(staticDir)
	indexFile := filepath.Join(resolvedStaticDir, "admin.html")
	ensureStaticIndex(indexFile)

	app := fiber.New(fiber.Config{
		Prefork:      false,
		ServerHeader: "Backend",
		AppName:      "Classivo Backend v8",
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
			"version": "v17-persistent",
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
	log.Printf("CORS origins: %s", corsOrigins)

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
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "🔨 SHUT UP! Rate limit exceeded. Please try again later.",
			})
		},
		SkipFailedRequests: false,
		LimiterMiddleware:  limiter.SlidingWindow{},
	}))

	api.Use(func(c *fiber.Ctx) error {
		if isPublicRoute(c.Path()) {
			return c.Next()
		}

		// Better token cleaning: remove all spaces AND sort pairs for hashing consistency
		parts := strings.Split(c.Get("X-CSRF-Token"), ";")
		for i := range parts {
			parts[i] = strings.ReplaceAll(parts[i], " ", "")
		}
		sort.Strings(parts)
		token := strings.Join(parts, ";")

		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Missing or empty X-CSRF-Token header",
			})
		}

		// Validate against ActiveSessions (memory) OR Supabase (persistent)
		hash := sha256.Sum256([]byte(token))
		hashStr := hex.EncodeToString(hash[:])

		if _, ok := globals.ActiveSessions.Load(hashStr); !ok {
			// Check Supabase as fallback
			db, err := databases.NewDatabaseHelper()
			if err == nil {
				if exists, _ := db.VerifySession(hashStr); exists {
					globals.ActiveSessions.Store(hashStr, true)
					return c.Next()
				}
			}
			log.Printf("[AUTH CHECK] Session NOT FOUND. Hash: %s", hashStr)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Session expired or invalid. Please login again.",
			})
		}

		return c.Next()
	})

	api.Use(func(c *fiber.Ctx) error {
		if isPublicRoute(c.Path()) {
			return c.Next()
		}

		if globals.DevMode {
			return c.Next()
		}

		token := c.Get("Authorization")
		if token == "" || !strings.HasPrefix(token, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Missing Authorization header",
			})
		}

		// Normalize Bearer token identically to CSRF and Login hashing
		rawToken := strings.TrimPrefix(token, "Bearer ")
		parts := strings.Split(rawToken, ";")
		for i := range parts {
			parts[i] = strings.ReplaceAll(parts[i], " ", "")
		}
		sort.Strings(parts)
		tokenStr := strings.Join(parts, ";")

		hash := sha256.Sum256([]byte(tokenStr))
		hashStr := hex.EncodeToString(hash[:])

		if _, ok := globals.ActiveSessions.Load(hashStr); !ok {
			// Check Supabase as fallback
			db, err := databases.NewDatabaseHelper()
			if err == nil {
				if exists, _ := db.VerifySession(hashStr); exists {
					globals.ActiveSessions.Store(hashStr, true)
					return c.Next()
				}
			}
			log.Printf("[AUTH BEARER] Session NOT FOUND. Hash: %s", hashStr)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Session expired or invalid. Please login again.",
			})
		}

		return c.Next()
	})

	api.Post("/admin/logout-all", func(c *fiber.Ctx) error {
		var body struct {
			Key string `json:"key"`
		}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
		}

		// Simple hardcoded key for now, as requested
		if body.Key != "Classivo-admin-secret" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid admin key"})
		}

		// Clear all sessions
		globals.ActiveSessions = sync.Map{}

		return c.JSON(fiber.Map{"message": "All users logged out successfully"})
	})

	api.Post("/admin/queries", handlers.HandleGetQueries)

	// Universal error handling middleware
	app.Use(func(c *fiber.Ctx) error {
		err := c.Next()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return nil
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

	app.Get("/healthz", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":    "ok",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	})

	api.Post("/login", func(c *fiber.Ctx) error {
		var creds struct {
			Username string  `json:"account"`
			Password string  `json:"password"`
			Cdigest  *string `json:"cdigest,omitempty"`
			Captcha  *string `json:"captcha,omitempty"`
		}

		if err := c.BodyParser(&creds); err != nil {
			log.Printf("Error parsing body: %v", err)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid JSON body",
			})
		}

		if creds.Username == "" || creds.Password == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Missing account or password",
			})
		}

		lf := &handlers.LoginFetcher{}
		session, err := lf.Login(creds.Username, creds.Password, creds.Cdigest, creds.Captcha)
		if err != nil {
			return err
		}

		return c.JSON(session)
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
		attendance, err := handlers.GetAttendance(c.Get("X-CSRF-Token"))
		if err != nil {
			return err
		}
		return c.JSON(attendance)
	})

	api.Get("/marks", cache.New(cacheConfig), func(c *fiber.Ctx) error {
		marks, err := handlers.GetMarks(c.Get("X-CSRF-Token"))
		if err != nil {
			return err
		}
		return c.JSON(marks)
	})

	api.Get("/courses", cache.New(cacheConfig), func(c *fiber.Ctx) error {
		courses, err := handlers.GetCourses(c.Get("X-CSRF-Token"))
		if err != nil {
			return err
		}
		return c.JSON(courses)
	})

	api.Get("/user", cache.New(cacheConfig), func(c *fiber.Ctx) error {
		user, err := handlers.GetUser(c.Get("X-CSRF-Token"))
		if err != nil {
			return err
		}
		return c.JSON(user)
	})

	api.Get("/calendar", cache.New(cacheConfig), func(c *fiber.Ctx) error {
		db, err := databases.NewCalDBHelper()
		if err != nil {
			return err
		}

		dbcal, err := db.GetEvents()
		if err != nil {
			return err
		}

		if len(dbcal.Calendar) == 0 {
			cal, err := handlers.GetCalendar(c.Get("X-CSRF-Token"))
			if err != nil {
				return err
			}
			go func() {
				for _, event := range cal.Calendar {
					for _, month := range event.Days {
						err = db.SetEvent(databases.CalendarEvent{
							ID:        utils.GenerateID(),
							Date:      month.Date,
							Month:     event.Month,
							Day:       month.Day,
							Order:     month.DayOrder,
							Event:     month.Event,
							CreatedAt: time.Now().UnixNano() / int64(time.Millisecond),
						})

						if err != nil {
							log.Printf("Error setting calendar event: %v", err)
							return
						}
					}
				}
			}()
			return c.JSON(cal)
		}

		return c.JSON(dbcal)

	})

	api.Get("/timetable", cache.New(cacheConfig), func(c *fiber.Ctx) error {
		tt, err := handlers.GetTimetable(c.Get("X-CSRF-Token"))
		if err != nil {
			return err
		}
		return c.JSON(tt)
	})

	api.Get("/get", cache.New(cacheConfig), func(c *fiber.Ctx) error {
		token := c.Get("X-CSRF-Token")
		encodedToken := utils.Encode(token)

		db, err := databases.NewDatabaseHelper()
		if err != nil {
			return err
		}

		cachedData, err := db.FindByToken("goscrape", encodedToken)

		// Check if cached data exists and all required fields are present and non-empty
		if len(cachedData) != 0 &&
			cachedData["timetable"] != nil &&
			cachedData["attendance"] != nil &&
			cachedData["marks"] != nil {

			// Always fetch ophour from db and add to cachedData
			ophour, err := db.GetOphourByToken(encodedToken)
			if err == nil && ophour != "" {
				cachedData["ophour"] = ophour
			}

			go func() {
				data, err := fetchAllData(token)
				if err != nil {
					return
				}
				if data != nil {
					data["token"] = encodedToken
					db.UpsertData("goscrape", data)
				}
			}()

			return c.JSON(cachedData)
		}

		data, err := fetchAllData(token)
		if err != nil {
			return utils.HandleError(c, err)
		}

		data["token"] = encodedToken

		js, _ := json.Marshal(data)

		go func() {
			err = db.UpsertData("goscrape", data)
		}()

		var responseData map[string]interface{}
		if err := json.Unmarshal(js, &responseData); err != nil {
			return err
		}
		return c.JSON(responseData)
	})

	api.Post("/payment/link", func(c *fiber.Ctx) error {
		var payload handlers.PaymentLinkRequest
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid payload"})
		}
		if payload.Name == "" || payload.Email == "" || payload.Contact == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "missing customer details"})
		}
		link, err := handlers.CreatePaymentLink(payload)
		if err != nil {
			return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(fiber.Map{"shortUrl": link})
	})

	api.Post("/ai/chat", func(c *fiber.Ctx) error {
		return handlers.HandleChatCompletion(c)
	})

	api.Post("/queries", handlers.HandleSubmitQuery)
	api.Post("/notifications/subscribe", handlers.HandleSaveSubscription)
	api.Post("/notifications/test", scheduler.HandleTestPush)


	// ----------------------------------------------------

	app.Use(func(c *fiber.Ctx) error {
		if strings.HasPrefix(c.Path(), "/api") {
			return c.Next()
		}
		if c.Method() != fiber.MethodGet && c.Method() != fiber.MethodHead {
			return c.Next()
		}
		if err := c.Next(); err != nil {
			if errors.Is(err, fiber.ErrNotFound) {
				return serveSPAIndex(c, indexFile)
			}
			return err
		}
		if c.Response().StatusCode() == fiber.StatusNotFound {
			return serveSPAIndex(c, indexFile)
		}
		return nil
	})

	log.Printf("Serving static frontend from %s", resolvedStaticDir)
	app.Static("/", resolvedStaticDir, fiber.Static{
		Compress:      true,
		Browse:        false,
		CacheDuration: 24 * time.Hour,
		MaxAge:        86400,
		Index:         "admin.html",
	})

	log.Printf("Starting server on port %s...", port)
	ln, err := net.Listen("tcp", "[::]:"+port)
	if err != nil {
		log.Fatalf("Failed to bind: %v", err)
	}
	if err := app.Listener(ln); err != nil {
		log.Printf("Server error: %+v", err)
	}
}

func fetchAllData(token string) (map[string]interface{}, error) {
	type result struct {
		key  string
		data interface{}
		err  error
	}

	resultChan := make(chan result, 5)

	go func() {
		data, err := handlers.GetUser(token)
		resultChan <- result{"user", data, err}
	}()
	go func() {
		data, err := handlers.GetAttendance(token)
		resultChan <- result{"attendance", data, err}
	}()
	go func() {
		data, err := handlers.GetMarks(token)
		resultChan <- result{"marks", data, err}
	}()
	go func() {
		data, err := handlers.GetCourses(token)
		resultChan <- result{"courses", data, err}
	}()
	go func() {
		data, err := handlers.GetTimetable(token)
		resultChan <- result{"timetable", data, err}
	}()

	data := make(map[string]interface{})
	for i := 0; i < 5; i++ {
		r := <-resultChan
		if r.err != nil {
			return nil, r.err
		}
		data[r.key] = r.data
	}

	if user, ok := data["user"].(*types.User); ok {
		data["regNumber"] = user.RegNumber
	}

	// Fetch ophour from database
	db, err := databases.NewDatabaseHelper()
	if err == nil {
		encodedToken := utils.Encode(token)
		ophour, err := db.GetOphourByToken(encodedToken)
		if err == nil && ophour != "" {
			data["ophour"] = ophour
		}
	}

	return data, nil
}

func isPublicRoute(path string) bool {
	path = strings.TrimSuffix(path, "/")
	switch path {
	case "/api/login", "/api/health", "/api/admin/logout-all", "/api/logout", "/api/ai/chat":
		return true
	default:
		return false
	}
}

func logEnvPresence() {
	required := []string{"VALIDATION_KEY", "SUPABASE_URL", "SUPABASE_ANON_KEY", "PORT"}
	for _, key := range required {
		if os.Getenv(key) == "" {
			if key == "PORT" {
				log.Printf("[WARN] %s is not set; defaulting to %s", key, defaultPort)
			} else {
				log.Printf("[WARN] %s is not set", key)
			}
		} else {
			log.Printf("[INFO] %s detected", key)
		}
	}
}

func ensureStaticIndex(indexPath string) {
	if info, err := os.Stat(indexPath); err != nil {
		log.Printf("[WARN] static index missing at %s: %v", indexPath, err)
	} else {
		log.Printf("Static index ready at %s (%d bytes)", indexPath, info.Size())
	}
}

func resolveStaticDir(configured string) string {
	candidates := []string{
		configured,
		filepath.Join(".", "static"),
		filepath.Join(".", "backend", "static"),
	}

	if wd, err := os.Getwd(); err == nil {
		candidates = append(candidates,
			filepath.Join(wd, "static"),
			filepath.Join(wd, "backend", "static"),
			filepath.Join(wd, "..", "static"),
		)
	}

	if exePath, err := os.Executable(); err == nil {
		exeDir := filepath.Dir(exePath)
		candidates = append(candidates,
			filepath.Join(exeDir, "static"),
			filepath.Join(exeDir, "..", "static"),
			filepath.Join(exeDir, "..", "backend", "static"),
		)
	}

	seen := make(map[string]struct{}, len(candidates))
	for _, candidate := range candidates {
		if candidate == "" {
			continue
		}
		absCandidate, err := filepath.Abs(candidate)
		if err != nil {
			continue
		}
		if _, ok := seen[absCandidate]; ok {
			continue
		}
		seen[absCandidate] = struct{}{}

		info, err := os.Stat(filepath.Join(absCandidate, "admin.html"))
		if err == nil && !info.IsDir() {
			return absCandidate
		}
	}

	return configured
}

func serveSPAIndex(c *fiber.Ctx, indexPath string) error {
	log.Printf("SPA fallback serving %s via %s", indexPath, c.Path())
	if err := c.SendFile(indexPath); err != nil {
		log.Printf("SPA fallback error for %s: %v", c.Path(), err)
		return c.Status(fiber.StatusInternalServerError).SendString("Static index not found")
	}
	return nil
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

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
