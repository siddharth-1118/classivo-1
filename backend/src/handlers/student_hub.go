package handlers

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"goscraper/src/helpers/databases"
	"goscraper/src/utils"

	"github.com/gofiber/fiber/v2"
	postgrest "github.com/supabase-community/postgrest-go"
)

type StudentIdentity struct {
	Email     string `json:"email"`
	Name      string `json:"name"`
	RegNumber string `json:"regNumber"`
	Semester  int    `json:"semester"`
	Section   string `json:"section"`
	Department string `json:"department"`
}

type ContentReportPayload struct {
	ContentType string `json:"contentType"`
	ContentID   string `json:"contentId"`
	Reason      string `json:"reason"`
}

type FacultyReviewPayload struct {
	Subject     string `json:"subject"`
	FacultyName string `json:"facultyName"`
	ReviewText  string `json:"reviewText"`
}

type ReplyPayload struct {
	Body string `json:"body"`
}

type AdminActionPayload struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Token    string `json:"token"`
	Reason   string `json:"reason"`
}

type HostelRoomPayload struct {
	HostelName string `json:"hostelName"`
	RoomNumber string `json:"roomNumber"`
}

func resolveStudentIdentity(c *fiber.Ctx) (*StudentIdentity, error) {
	token := c.Get("X-CSRF-Token")
	if token == "" {
		token = strings.TrimPrefix(c.Get("Authorization"), "Bearer ")
	}
	if token == "" {
		return nil, fmt.Errorf("missing auth token")
	}

	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return nil, err
	}

	encodedToken := utils.Encode(token)
	userData, err := db.FindByToken("goscrape", encodedToken)

	identity := &StudentIdentity{
		Email:     "unknown@srmist.edu.in",
		Name:      "Anonymous Student",
		RegNumber: "UNKNOWN",
		Semester:  0,
		Section:   "",
		Department: "",
	}

	if userData == nil {
		return identity, nil
	}

	if reg, ok := userData["regNumber"].(string); ok && strings.TrimSpace(reg) != "" {
		identity.RegNumber = reg
		identity.Email = strings.ToLower(reg) + "@srmist.edu.in"
	}

	if userMap, ok := userData["user"].(map[string]interface{}); ok {
		if email, ok := userMap["email"].(string); ok && strings.TrimSpace(email) != "" {
			identity.Email = strings.ToLower(strings.TrimSpace(email))
		}
		if name, ok := userMap["name"].(string); ok && strings.TrimSpace(name) != "" {
			identity.Name = strings.TrimSpace(name)
		}
		if reg, ok := userMap["regNumber"].(string); ok && strings.TrimSpace(reg) != "" {
			identity.RegNumber = strings.TrimSpace(reg)
		}
		if section, ok := userMap["section"].(string); ok {
			identity.Section = strings.TrimSpace(section)
		}
		if department, ok := userMap["department"].(string); ok {
			identity.Department = strings.TrimSpace(department)
		}
		identity.Semester = extractSemester(userMap["semester"])
	}

	if identity.RegNumber != "UNKNOWN" && strings.HasPrefix(identity.Email, "unknown") {
		identity.Email = strings.ToLower(identity.RegNumber) + "@srmist.edu.in"
	}

	if identity.Name == "Anonymous Student" || identity.RegNumber == "UNKNOWN" {
		if liveUser, liveErr := GetUser(token); liveErr == nil && liveUser != nil {
			if strings.TrimSpace(liveUser.Name) != "" {
				identity.Name = strings.TrimSpace(liveUser.Name)
			}
			if strings.TrimSpace(liveUser.RegNumber) != "" {
				identity.RegNumber = strings.TrimSpace(liveUser.RegNumber)
				identity.Email = strings.ToLower(identity.RegNumber) + "@srmist.edu.in"
			}
			if strings.TrimSpace(liveUser.Section) != "" {
				identity.Section = strings.TrimSpace(liveUser.Section)
			}
			if strings.TrimSpace(liveUser.Department) != "" {
				identity.Department = strings.TrimSpace(liveUser.Department)
			}
			if liveUser.Semester > 0 {
				identity.Semester = liveUser.Semester
			}
		}
	}

	return identity, nil
}

func normalizeHostelValue(value string) string {
	normalized := strings.ToLower(strings.TrimSpace(value))
	replacer := strings.NewReplacer(
		"-", " ",
		"_", " ",
		".", " ",
		",", " ",
		"/", " ",
		"\\", " ",
		"(", " ",
		")", " ",
	)
	normalized = replacer.Replace(normalized)
	return strings.Join(strings.Fields(normalized), " ")
}

func HandleGetHostelRoommate(c *fiber.Ctx) error {
	identity, err := resolveStudentIdentity(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unable to resolve student identity"})
	}

	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	var entries []map[string]interface{}
	_, err = db.Client().From("hostel_room_entries").
		Select("*", "", false).
		Eq("reg_number", identity.RegNumber).
		Limit(1, "").
		ExecuteTo(&entries)
	if err != nil || len(entries) == 0 {
		return c.JSON(fiber.Map{
			"entry":      nil,
			"roommates":  []interface{}{},
			"hasMatch":   false,
			"matchCount": 0,
		})
	}

	entry := entries[0]
	normalizedHostel := strings.TrimSpace(fmt.Sprintf("%v", entry["normalized_hostel_name"]))
	normalizedRoom := strings.TrimSpace(fmt.Sprintf("%v", entry["normalized_room_number"]))

	var matching []map[string]interface{}
	if normalizedHostel != "" && normalizedRoom != "" {
		_, _ = db.Client().From("hostel_room_entries").
			Select("*", "", false).
			Eq("normalized_hostel_name", normalizedHostel).
			Eq("normalized_room_number", normalizedRoom).
			Order("student_name", &postgrest.OrderOpts{Ascending: true}).
			ExecuteTo(&matching)
	}

	roommates := make([]map[string]interface{}, 0)
	for _, record := range matching {
		regNumber := strings.TrimSpace(fmt.Sprintf("%v", record["reg_number"]))
		if regNumber == identity.RegNumber {
			continue
		}

		roommates = append(roommates, map[string]interface{}{
			"name":       strings.TrimSpace(fmt.Sprintf("%v", record["student_name"])),
			"department": strings.TrimSpace(fmt.Sprintf("%v", record["department"])),
			"hostelName": strings.TrimSpace(fmt.Sprintf("%v", record["hostel_name"])),
			"roomNumber": strings.TrimSpace(fmt.Sprintf("%v", record["room_number"])),
		})
	}

	return c.JSON(fiber.Map{
		"entry": fiber.Map{
			"hostelName": strings.TrimSpace(fmt.Sprintf("%v", entry["hostel_name"])),
			"roomNumber": strings.TrimSpace(fmt.Sprintf("%v", entry["room_number"])),
		},
		"roommates":  roommates,
		"hasMatch":   len(roommates) > 0,
		"matchCount": len(roommates),
	})
}

func HandleUpsertHostelRoommate(c *fiber.Ctx) error {
	identity, err := resolveStudentIdentity(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unable to resolve student identity"})
	}

	var payload HostelRoomPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	payload.HostelName = strings.TrimSpace(payload.HostelName)
	payload.RoomNumber = strings.TrimSpace(payload.RoomNumber)

	if payload.HostelName == "" || payload.RoomNumber == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "hostelName and roomNumber are required"})
	}

	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	data := map[string]interface{}{
		"user_email":              identity.Email,
		"student_name":            identity.Name,
		"reg_number":              identity.RegNumber,
		"department":              identity.Department,
		"hostel_name":             payload.HostelName,
		"normalized_hostel_name":  normalizeHostelValue(payload.HostelName),
		"room_number":             payload.RoomNumber,
		"normalized_room_number":  normalizeHostelValue(payload.RoomNumber),
		"updated_at":              time.Now().UTC().Format(time.RFC3339),
	}

	var existing []map[string]interface{}
	_, _ = db.Client().From("hostel_room_entries").
		Select("id", "", false).
		Eq("reg_number", identity.RegNumber).
		Limit(1, "").
		ExecuteTo(&existing)

	if len(existing) > 0 {
		_, _, err = db.Client().From("hostel_room_entries").Update(data, "", "").Eq("reg_number", identity.RegNumber).Execute()
	} else {
		data["created_at"] = time.Now().UTC().Format(time.RFC3339)
		_, _, err = db.Client().From("hostel_room_entries").Insert(data, false, "", "", "").Execute()
	}

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save hostel room details"})
	}

	return c.JSON(fiber.Map{"message": "Hostel room details saved successfully"})
}

func extractSemester(value interface{}) int {
	switch v := value.(type) {
	case float64:
		return int(v)
	case int:
		return v
	case int64:
		return int(v)
	case string:
		n, err := strconv.Atoi(strings.TrimSpace(v))
		if err == nil {
			return n
		}
	}
	return 0
}

func baseStaticDir() string {
	candidates := []string{"../static", "./static"}
	for _, candidate := range candidates {
		if info, err := os.Stat(candidate); err == nil && info.IsDir() {
			return candidate
		}
	}
	return "./static"
}

func saveUploadedFile(c *fiber.Ctx, fieldName string, subDir string, allowedExts map[string]bool) (string, string, string, error) {
	fileHeader, err := c.FormFile(fieldName)
	if err != nil {
		return "", "", "", err
	}

	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if len(allowedExts) > 0 && !allowedExts[ext] {
		return "", "", "", fmt.Errorf("unsupported file type: %s", ext)
	}

	targetDir := filepath.Join(baseStaticDir(), "uploads", subDir)
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return "", "", "", err
	}

	storedName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	fullPath := filepath.Join(targetDir, storedName)
	if err := c.SaveFile(fileHeader, fullPath); err != nil {
		return "", "", "", err
	}

	publicPath := fmt.Sprintf("/uploads/%s/%s", subDir, storedName)
	return publicPath, fileHeader.Filename, fileHeader.Header.Get("Content-Type"), nil
}

func HandleListNotes(c *fiber.Ctx) error {
	identity, err := resolveStudentIdentity(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unable to resolve student identity"})
	}

	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	var approved []map[string]interface{}
	_, err = db.Client().From("notes_uploads").
		Select("*", "", false).
		Eq("approval_status", "approved").
		Order("created_at", nil).
		ExecuteTo(&approved)
	if err != nil {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"notes": []interface{}{}, "mine": []interface{}{}})
	}

	var mine []map[string]interface{}
	_, _ = db.Client().From("notes_uploads").
		Select("*", "", false).
		Eq("user_email", identity.Email).
		Order("created_at", nil).
		ExecuteTo(&mine)

	semester := strings.TrimSpace(c.Query("semester"))
	if semester != "" {
		approved = filterRowsByValue(approved, "semester", semester)
		mine = filterRowsByValue(mine, "semester", semester)
	}

	return c.JSON(fiber.Map{
		"notes": approved,
		"mine":  mine,
	})
}

func HandleUploadNote(c *fiber.Ctx) error {
	identity, err := resolveStudentIdentity(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unable to resolve student identity"})
	}

	semester, _ := strconv.Atoi(strings.TrimSpace(c.FormValue("semester")))
	subject := strings.TrimSpace(c.FormValue("subject"))
	unit := strings.TrimSpace(c.FormValue("unit"))
	title := strings.TrimSpace(c.FormValue("title"))

	if semester == 0 || subject == "" || unit == "" || title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "semester, subject, unit, and title are required"})
	}

	fileURL, originalName, fileType, err := saveUploadedFile(c, "file", "notes", map[string]bool{
		".pdf":  true,
		".png":  true,
		".jpg":  true,
		".jpeg": true,
		".webp": true,
		".doc":  true,
		".docx": true,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	data := map[string]interface{}{
		"user_email":      identity.Email,
		"student_name":    identity.Name,
		"reg_number":      identity.RegNumber,
		"semester":        semester,
		"subject":         subject,
		"unit":            unit,
		"title":           title,
		"file_url":        fileURL,
		"file_name":       originalName,
		"file_type":       fileType,
		"approval_status": "pending",
		"created_at":      time.Now().UTC().Format(time.RFC3339),
	}

	_, _, err = db.Client().From("notes_uploads").Insert(data, false, "", "", "").Execute()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save note upload"})
	}

	return c.JSON(fiber.Map{"message": "Note uploaded and sent for admin approval"})
}

func HandleListCommunityPosts(c *fiber.Ctx) error {
	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	var posts []map[string]interface{}
	_, err = db.Client().From("community_posts").
		Select("*", "", false).
		Eq("status", "active").
		Order("created_at", nil).
		ExecuteTo(&posts)
	if err != nil {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"posts": []interface{}{}})
	}

	var replies []map[string]interface{}
	_, _ = db.Client().From("community_replies").
		Select("post_id", "", false).
		Eq("status", "active").
		ExecuteTo(&replies)

	replyCount := make(map[string]int)
	for _, reply := range replies {
		postID, _ := reply["post_id"].(string)
		replyCount[postID]++
	}

	for _, post := range posts {
		postID, _ := post["id"].(string)
		post["replyCount"] = replyCount[postID]
		if isAnonymous, ok := post["is_anonymous"].(bool); ok && isAnonymous {
			post["student_name"] = "Anonymous Student"
			post["reg_number"] = ""
		}
	}

	return c.JSON(fiber.Map{"posts": posts})
}

func HandleCreateCommunityPost(c *fiber.Ctx) error {
	identity, err := resolveStudentIdentity(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unable to resolve student identity"})
	}

	title := strings.TrimSpace(c.FormValue("title"))
	description := strings.TrimSpace(c.FormValue("description"))
	category := strings.TrimSpace(c.FormValue("category"))
	if category == "" {
		category = "general"
	}

	if title == "" || description == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "title and description are required"})
	}

	imageURL := ""
	if _, err := c.FormFile("image"); err == nil {
		savedURL, _, _, uploadErr := saveUploadedFile(c, "image", "community", map[string]bool{
			".png":  true,
			".jpg":  true,
			".jpeg": true,
			".webp": true,
		})
		if uploadErr != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": uploadErr.Error()})
		}
		imageURL = savedURL
	}

	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	data := map[string]interface{}{
		"user_email":   identity.Email,
		"student_name": identity.Name,
		"reg_number":   identity.RegNumber,
		"title":        title,
		"description":  description,
		"image_url":    imageURL,
		"category":     category,
		"is_anonymous": true,
		"status":       "active",
		"created_at":   time.Now().UTC().Format(time.RFC3339),
	}

	_, _, err = db.Client().From("community_posts").Insert(data, false, "", "", "").Execute()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create post"})
	}

	return c.JSON(fiber.Map{"message": "Community post published"})
}

func HandleListCommunityReplies(c *fiber.Ctx) error {
	postID := strings.TrimSpace(c.Params("id"))
	if postID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing post id"})
	}

	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	var replies []map[string]interface{}
	_, err = db.Client().From("community_replies").
		Select("*", "", false).
		Eq("post_id", postID).
		Eq("status", "active").
		Order("created_at", &postgrest.OrderOpts{Ascending: true}).
		ExecuteTo(&replies)
	if err != nil {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"replies": []interface{}{}})
	}

	for _, reply := range replies {
		if isAnonymous, ok := reply["is_anonymous"].(bool); ok && isAnonymous {
			reply["student_name"] = "Anonymous Student"
			reply["reg_number"] = ""
		}
	}

	return c.JSON(fiber.Map{"replies": replies})
}

func HandleCreateCommunityReply(c *fiber.Ctx) error {
	identity, err := resolveStudentIdentity(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unable to resolve student identity"})
	}

	postID := strings.TrimSpace(c.Params("id"))
	if postID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing post id"})
	}

	var payload ReplyPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	payload.Body = strings.TrimSpace(payload.Body)
	if payload.Body == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Reply text is required"})
	}

	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	data := map[string]interface{}{
		"post_id":      postID,
		"user_email":   identity.Email,
		"student_name": identity.Name,
		"reg_number":   identity.RegNumber,
		"body":         payload.Body,
		"is_anonymous": true,
		"status":       "active",
		"created_at":   time.Now().UTC().Format(time.RFC3339),
	}

	_, _, err = db.Client().From("community_replies").Insert(data, false, "", "", "").Execute()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create reply"})
	}

	return c.JSON(fiber.Map{"message": "Reply added"})
}

func HandleReportContent(c *fiber.Ctx) error {
	identity, err := resolveStudentIdentity(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unable to resolve student identity"})
	}

	var payload ContentReportPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	payload.ContentType = strings.TrimSpace(payload.ContentType)
	payload.ContentID = strings.TrimSpace(payload.ContentID)
	payload.Reason = strings.TrimSpace(payload.Reason)
	if payload.ContentType == "" || payload.ContentID == "" || payload.Reason == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "contentType, contentId, and reason are required"})
	}

	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	data := map[string]interface{}{
		"content_type":        payload.ContentType,
		"content_id":          payload.ContentID,
		"reason":              payload.Reason,
		"reporter_email":      identity.Email,
		"reporter_reg_number": identity.RegNumber,
		"status":              "open",
		"created_at":          time.Now().UTC().Format(time.RFC3339),
	}

	_, _, err = db.Client().From("content_reports").Insert(data, false, "", "", "").Execute()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to submit report"})
	}

	return c.JSON(fiber.Map{"message": "Report submitted to admin"})
}

func HandleListFacultyReviews(c *fiber.Ctx) error {
	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	var reviews []map[string]interface{}
	query := db.Client().From("faculty_reviews").
		Select("*", "", false).
		Eq("status", "active")

	if subject := strings.TrimSpace(c.Query("subject")); subject != "" {
		query = query.Eq("subject", subject)
	}

	_, err = query.Order("created_at", nil).ExecuteTo(&reviews)
	if err != nil {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"reviews": []interface{}{}})
	}

	for _, review := range reviews {
		if isAnonymous, ok := review["is_anonymous"].(bool); ok && isAnonymous {
			review["student_name"] = "Anonymous Student"
			review["reg_number"] = ""
		}
	}

	return c.JSON(fiber.Map{"reviews": reviews})
}

func HandleCreateFacultyReview(c *fiber.Ctx) error {
	identity, err := resolveStudentIdentity(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unable to resolve student identity"})
	}

	var payload FacultyReviewPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	payload.Subject = strings.TrimSpace(payload.Subject)
	payload.FacultyName = strings.TrimSpace(payload.FacultyName)
	payload.ReviewText = strings.TrimSpace(payload.ReviewText)

	if payload.Subject == "" || payload.ReviewText == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "subject and reviewText are required"})
	}

	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	data := map[string]interface{}{
		"user_email":   identity.Email,
		"student_name": identity.Name,
		"reg_number":   identity.RegNumber,
		"subject":      payload.Subject,
		"faculty_name": payload.FacultyName,
		"review_text":  payload.ReviewText,
		"is_anonymous": true,
		"status":       "active",
		"created_at":   time.Now().UTC().Format(time.RFC3339),
	}

	_, _, err = db.Client().From("faculty_reviews").Insert(data, false, "", "", "").Execute()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to submit review"})
	}

	return c.JSON(fiber.Map{"message": "Faculty review submitted"})
}

func HandleListEvents(c *fiber.Ctx) error {
	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	var events []map[string]interface{}
	_, err = db.Client().From("campus_events").
		Select("*", "", false).
		Eq("status", "active").
		Order("event_date", &postgrest.OrderOpts{Ascending: true}).
		ExecuteTo(&events)
	if err != nil {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"events": []interface{}{}})
	}

	return c.JSON(fiber.Map{"events": events})
}

func HandleGetModeration(c *fiber.Ctx) error {
	var body AdminCredentialsPayload
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	valid, _ := validateAdminCredentials(body)
	if !valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid administrative credentials or session token."})
	}

	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	load := func(table string) []map[string]interface{} {
		var rows []map[string]interface{}
		_, err := db.Client().From(table).Select("*", "", false).Order("created_at", nil).ExecuteTo(&rows)
		if err != nil {
			return []map[string]interface{}{}
		}
		return rows
	}

	return c.JSON(fiber.Map{
		"notes":   load("notes_uploads"),
		"reports": load("content_reports"),
		"reviews": load("faculty_reviews"),
		"events":  load("campus_events"),
	})
}

func HandleApproveNote(c *fiber.Ctx) error {
	return handleNoteStatusUpdate(c, "approved")
}

func HandleRejectNote(c *fiber.Ctx) error {
	return handleNoteStatusUpdate(c, "rejected")
}

func handleNoteStatusUpdate(c *fiber.Ctx, status string) error {
	var body AdminActionPayload
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	valid, _ := validateAdminCredentials(AdminCredentialsPayload{
		Email: body.Email, Password: body.Password, Token: body.Token,
	})
	if !valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid administrative credentials or session token."})
	}

	noteID := strings.TrimSpace(c.Params("id"))
	if noteID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing note id"})
	}

	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	update := map[string]interface{}{
		"approval_status": status,
		"approved_by":     body.Email,
	}
	if status == "rejected" {
		update["rejection_reason"] = strings.TrimSpace(body.Reason)
	}

	_, _, err = db.Client().From("notes_uploads").Update(update, "", "").Eq("id", noteID).Execute()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update note status"})
	}

	return c.JSON(fiber.Map{"message": "Note status updated"})
}

func HandleDismissReport(c *fiber.Ctx) error {
	return handleReportDecision(c, false)
}

func HandleRemoveReportedContent(c *fiber.Ctx) error {
	return handleReportDecision(c, true)
}

func handleReportDecision(c *fiber.Ctx, removeContent bool) error {
	var body AdminActionPayload
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	valid, _ := validateAdminCredentials(AdminCredentialsPayload{
		Email: body.Email, Password: body.Password, Token: body.Token,
	})
	if !valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid administrative credentials or session token."})
	}

	reportID := strings.TrimSpace(c.Params("id"))
	if reportID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing report id"})
	}

	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	var reports []map[string]interface{}
	_, err = db.Client().From("content_reports").Select("*", "", false).Eq("id", reportID).Limit(1, "").ExecuteTo(&reports)
	if err != nil || len(reports) == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Report not found"})
	}

	report := reports[0]
	if removeContent {
		contentType, _ := report["content_type"].(string)
		contentID, _ := report["content_id"].(string)
		if tableName, ok := contentTableByType(contentType); ok {
			_, _, err = db.Client().From(tableName).Update(map[string]interface{}{"status": "removed"}, "", "").Eq("id", contentID).Execute()
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to remove reported content"})
			}
		}
	}

	reportStatus := "dismissed"
	if removeContent {
		reportStatus = "resolved"
	}

	_, _, err = db.Client().From("content_reports").Update(map[string]interface{}{
		"status":      reportStatus,
		"resolved_by": body.Email,
		"resolved_at": time.Now().UTC().Format(time.RFC3339),
	}, "", "").Eq("id", reportID).Execute()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update report"})
	}

	return c.JSON(fiber.Map{"message": "Report updated"})
}

func contentTableByType(contentType string) (string, bool) {
	switch contentType {
	case "community_post":
		return "community_posts", true
	case "community_reply":
		return "community_replies", true
	case "faculty_review":
		return "faculty_reviews", true
	default:
		return "", false
	}
}

func HandleCreateEvent(c *fiber.Ctx) error {
	email := strings.TrimSpace(c.FormValue("email"))
	password := strings.TrimSpace(c.FormValue("password"))
	token := strings.TrimSpace(c.FormValue("token"))
	valid, _ := validateAdminCredentials(AdminCredentialsPayload{Email: email, Password: password, Token: token})
	if !valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid administrative credentials or session token."})
	}

	title := strings.TrimSpace(c.FormValue("title"))
	description := strings.TrimSpace(c.FormValue("description"))
	eventDate := strings.TrimSpace(c.FormValue("eventDate"))
	eventTime := strings.TrimSpace(c.FormValue("eventTime"))
	venue := strings.TrimSpace(c.FormValue("venue"))
	registrationLink := strings.TrimSpace(c.FormValue("registrationLink"))
	if title == "" || description == "" || eventDate == "" || eventTime == "" || venue == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "title, description, eventDate, eventTime, and venue are required"})
	}

	imageURL := ""
	if _, err := c.FormFile("image"); err == nil {
		savedURL, _, _, uploadErr := saveUploadedFile(c, "image", "events", map[string]bool{
			".png":  true,
			".jpg":  true,
			".jpeg": true,
			".webp": true,
		})
		if uploadErr != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": uploadErr.Error()})
		}
		imageURL = savedURL
	}

	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	data := map[string]interface{}{
		"title":             title,
		"description":       description,
		"image_url":         imageURL,
		"event_date":        eventDate,
		"event_time":        eventTime,
		"venue":             venue,
		"registration_link": registrationLink,
		"created_by":        email,
		"status":            "active",
		"created_at":        time.Now().UTC().Format(time.RFC3339),
	}

	_, _, err = db.Client().From("campus_events").Insert(data, false, "", "", "").Execute()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create event"})
	}

	return c.JSON(fiber.Map{"message": "Event created"})
}

func HandleDeleteEvent(c *fiber.Ctx) error {
	var body AdminActionPayload
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	valid, _ := validateAdminCredentials(AdminCredentialsPayload{
		Email: body.Email, Password: body.Password, Token: body.Token,
	})
	if !valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid administrative credentials or session token."})
	}

	eventID := strings.TrimSpace(c.Params("id"))
	if eventID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing event id"})
	}

	db, err := databases.NewDatabaseHelper()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal database error"})
	}

	_, _, err = db.Client().From("campus_events").Update(map[string]interface{}{"status": "removed"}, "", "").Eq("id", eventID).Execute()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to remove event"})
	}

	return c.JSON(fiber.Map{"message": "Event removed"})
}

func filterRowsByValue(rows []map[string]interface{}, key string, expected string) []map[string]interface{} {
	filtered := make([]map[string]interface{}, 0)
	for _, row := range rows {
		value := fmt.Sprintf("%v", row[key])
		if strings.TrimSpace(value) == expected {
			filtered = append(filtered, row)
		}
	}
	sort.Slice(filtered, func(i, j int) bool {
		left := fmt.Sprintf("%v", filtered[i]["created_at"])
		right := fmt.Sprintf("%v", filtered[j]["created_at"])
		return left > right
	})
	return filtered
}
