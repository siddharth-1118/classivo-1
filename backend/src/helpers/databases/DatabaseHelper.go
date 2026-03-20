package databases

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"goscraper/src/globals"
	"io"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/supabase-community/supabase-go"
)

type DatabaseHelper struct {
	client *supabase.Client
	key    []byte
}

func NewDatabaseHelper() (*DatabaseHelper, error) {
	if globals.DevMode {
		godotenv.Load()
	}
	supabaseUrl := strings.Trim(strings.Trim(os.Getenv("SUPABASE_URL"), " "), "\"")
	supabaseKey := strings.Trim(strings.Trim(os.Getenv("SUPABASE_SERVICE_ROLE_KEY"), " "), "\"")
	source := "SUPABASE_SERVICE_ROLE_KEY"
	if supabaseKey == "" {
		supabaseKey = strings.Trim(strings.Trim(os.Getenv("SUPABASE_KEY"), " "), "\"")
		source = "SUPABASE_KEY"
	}
	if supabaseKey == "" {
		supabaseKey = strings.Trim(strings.Trim(os.Getenv("SUPABASE_ANON_KEY"), " "), "\"")
		source = "SUPABASE_ANON_KEY"
	}
	encryptionKey := os.Getenv("ENCRYPTION_KEY")

	if supabaseUrl == "" || supabaseKey == "" {
		fmt.Printf("[DB DEBUG] Missing credentials: URL=%v, Key(source:%s)=%v\n", supabaseUrl != "", source, supabaseKey != "")
	} else {
		fmt.Printf("[DB DEBUG] Initializing Supabase with URL: %s... Key source: %s, Key length: %d\n",
			supabaseUrl[:min(10, len(supabaseUrl))], source, len(supabaseKey))
	}

	client, err := supabase.NewClient(supabaseUrl, supabaseKey, nil)
	if err != nil {
		return nil, err
	}
	hash := sha256.Sum256([]byte(encryptionKey))
	return &DatabaseHelper{
		client: client,
		key:    hash[:],
	}, nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func (db *DatabaseHelper) Client() *supabase.Client {
	return db.client
}

func (db *DatabaseHelper) encrypt(text string) (string, error) {
	block, err := aes.NewCipher(db.key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(text), nil)
	encrypted := base64.StdEncoding.EncodeToString(ciphertext)
	return encrypted, nil
}

func (db *DatabaseHelper) decrypt(encryptedText string) (string, error) {
	ciphertext, err := base64.StdEncoding.DecodeString(encryptedText)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(db.key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", err
	}

	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

func (db *DatabaseHelper) UpsertData(table string, data map[string]interface{}) error {
	regNumber, hasRegNumber := data["regNumber"]
	token, hasToken := data["token"]

	data["lastUpdated"] = time.Now().UnixNano() / int64(time.Millisecond)

	for key, value := range data {
		if key != "regNumber" && key != "token" && key != "lastUpdated" && key != "timetable" && key != "ophour" {
			jsonBytes, err := json.Marshal(value)
			if err != nil {
				return err
			}
			// Encryption disabled per user request
			// encrypted, err := db.encrypt(string(jsonBytes))
			// if err != nil {
			// 	return err
			// }
			// data[key] = encrypted
			data[key] = string(jsonBytes)
		}

	}

	if hasRegNumber {
		data["regNumber"] = regNumber
	}
	if hasToken {
		data["token"] = token
	}

	_, _, err := db.client.From(table).Upsert(data, "regNumber", "", "").Execute()
	return err
}

func (db *DatabaseHelper) ReadData(table string, query map[string]interface{}) ([]map[string]interface{}, error) {
	var results []map[string]interface{}

	queryAsString := make(map[string]string)
	for k, v := range query {
		if str, ok := v.(string); ok {
			queryAsString[k] = str
		}
	}

	_, err := db.client.From(table).Select("*", "", false).Match(queryAsString).ExecuteTo(&results)
	if err != nil {
		return nil, err
	}

	for _, row := range results {
		for key, value := range row {
			if str, ok := value.(string); ok {
				if key != "regNumber" && key != "token" && key != "lastUpdated" && key != "timetable" && key != "ophour" {
					// Decryption disabled - assuming plaintext
					// decrypted, err := db.decrypt(str)
					// if err != nil {
					// 	return nil, err
					// }
					// row[key] = decrypted
					row[key] = str
				}
			}
		}
	}

	return results, nil
}

func (db *DatabaseHelper) FindByToken(table string, token string) (map[string]interface{}, error) {
	var results []map[string]interface{}

	query := map[string]string{
		"token": token,
	}

	_, err := db.client.From(table).Select("*", "", false).Match(query).ExecuteTo(&results)
	if err != nil {
		return nil, err
	}

	if len(results) == 0 {
		return nil, nil
	}

	for key, value := range results[0] {
		if str, ok := value.(string); ok {
			if key == "timetable" {
				var jsonData interface{}
				if err := json.Unmarshal([]byte(str), &jsonData); err != nil {
					return nil, err
				}
				results[0][key] = jsonData
			} else if key != "regNumber" && key != "token" && key != "lastUpdated" && key != "timetable" && key != "ophour" {
				// Decryption disabled - assuming plaintext
				// decrypted, err := db.decrypt(str)
				// if err != nil {
				// 	return nil, err
				// }
				var jsonData interface{}
				// if err := json.Unmarshal([]byte(decrypted), &jsonData); err != nil {
				if err := json.Unmarshal([]byte(str), &jsonData); err != nil {
					return nil, err
				}
				results[0][key] = jsonData
			}
		}
	}

	return results[0], nil
}

func (db *DatabaseHelper) GetOphourByToken(token string) (string, error) {
	var results []map[string]interface{}

	query := map[string]string{
		"token": token,
	}

	_, err := db.client.From("goscrape").Select("ophour", "", false).Match(query).ExecuteTo(&results)
	if err != nil {
		return "", err
	}

	if len(results) == 0 {
		return "", nil
	}

	ophour, ok := results[0]["ophour"].(string)
	if !ok {
		return "", nil
	}
	return ophour, nil
}

// GetCachedDataByKey retrieves cached data by a specific key (e.g., "marks", "attendance")
// Returns the data, whether it exists, whether it's fresh (< 1 hour), and any error
func (db *DatabaseHelper) GetCachedDataByKey(token string, dataKey string) (interface{}, bool, bool, error) {
	cachedData, err := db.FindByToken("goscrape", token)
	if err != nil {
		return nil, false, false, err
	}

	if len(cachedData) == 0 {
		return nil, false, false, nil
	}

	// Check if the requested key exists in cache
	data, exists := cachedData[dataKey]
	if !exists || data == nil {
		return nil, false, false, nil
	}

	// Check staleness (1 hour = 3600000 milliseconds)
	lastUpdated, ok := cachedData["lastUpdated"]
	if !ok {
		return data, true, false, nil // Data exists but no timestamp, consider stale
	}

	var lastUpdatedMs int64
	switch v := lastUpdated.(type) {
	case int64:
		lastUpdatedMs = v
	case float64:
		lastUpdatedMs = int64(v)
	case int:
		lastUpdatedMs = int64(v)
	default:
		return data, true, false, nil // Unknown type, consider stale
	}

	currentTime := time.Now().UnixNano() / int64(time.Millisecond)
	age := currentTime - lastUpdatedMs
	isFresh := age < 3600000 // 1 hour in milliseconds

	return data, true, isFresh, nil
}

// UpsertDataByKey updates a specific key in the cache
func (db *DatabaseHelper) UpsertDataByKey(token string, regNumber string, dataKey string, data interface{}) error {
	// First, get existing data to preserve other keys
	existingData, err := db.FindByToken("goscrape", token)
	if err != nil {
		// If no existing data, create new
		existingData = make(map[string]interface{})
	}

	if existingData == nil {
		existingData = make(map[string]interface{})
	}

	// Update the specific key
	existingData[dataKey] = data
	existingData["token"] = token
	if regNumber != "" {
		existingData["regNumber"] = regNumber
	}

	return db.UpsertData("goscrape", existingData)
}

func (db *DatabaseHelper) SaveSession(hash string) error {
	data := map[string]interface{}{
		"hash_key":   hash,
		"created_at": time.Now().Format(time.RFC3339),
	}
	_, _, err := db.client.From("sessions").Upsert(data, "hash_key", "", "").Execute()
	return err
}

func (db *DatabaseHelper) VerifySession(hash string) (bool, error) {
	var results []map[string]interface{}
	query := map[string]string{"hash_key": hash}
	_, err := db.client.From("sessions").Select("hash_key", "", false).Match(query).ExecuteTo(&results)
	if err != nil {
		return false, err
	}
	return len(results) > 0, nil
}

func (db *DatabaseHelper) SaveChatMessage(room, text, senderId, senderAlias string) error {
	data := map[string]interface{}{
		"room":         room,
		"text":         text,
		"sender_id":    senderId,
		"sender_alias": senderAlias,
		"created_at":   time.Now().Format(time.RFC3339),
	}
	_, _, err := db.client.From("messages").Insert(data, false, "", "", "").Execute()
	return err
}

func (db *DatabaseHelper) GetRecentMessages(room string, limit int) ([]map[string]interface{}, error) {
	var results []map[string]interface{}
	query := map[string]string{"room": room}
	_, err := db.client.From("messages").
		Select("*", "", false).
		Match(query).
		Limit(limit, "").
		ExecuteTo(&results)
	
	if err != nil {
		return nil, err
	}
	
	// Reverse to show in chronological order
	for i, j := 0, len(results)-1; i < j; i, j = i+1, j-1 {
		results[i], results[j] = results[j], results[i]
	}
	
	return results, nil
}

func (db *DatabaseHelper) VerifyAdmin(email, password string) (bool, error) {
	var results []map[string]interface{}
	query := map[string]string{
		"email":    email,
		"password": password,
	}
	_, err := db.client.From("admins").Select("*", "", false).Match(query).ExecuteTo(&results)
	if err != nil {
		return false, err
	}
	return len(results) > 0, nil
}
