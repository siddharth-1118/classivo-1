package chat

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"log"
	"strings"
	"time"

	"goscraper/src/helpers/databases"
	"goscraper/src/types"

	"github.com/gofiber/websocket/v2"
)

// hub holds the active clients and broadcasts messages.
var hub = newHub()

func init() {
	go hub.run()
}

// Message is a struct to hold the message data
type Message struct {
	Action        string `json:"action"` // "join" or "message"
	Room          string `json:"room"`
	Text          string `json:"text,omitempty"`
	SenderID      string `json:"senderId,omitempty"`
	SenderAlias   string `json:"senderAlias,omitempty"`
	SenderSection string `json:"senderSection,omitempty"`
	Timestamp     string `json:"timestamp,omitempty"`
}

type anonymousIdentity struct {
	ID    string
	Alias string
}

// ChatWebsocket handles websocket connections for the chat.
func ChatWebsocket(c *websocket.Conn) {
	log.Printf("[WS DEBUG] ChatWebsocket handler entered")
	// Token is strictly verified by main.go middleware before this handler is invoked.
	// We receive lightweight identity parameters securely via WebSocket URL queries.
	user := &types.User{
		Section:   c.Query("section"),
		RegNumber: c.Query("reg"),
	}
	if user.RegNumber == "" {
		user.RegNumber = "UNKNOWN"
	}

	identity := buildAnonymousIdentity(user)
	primaryRoom := normalizeRoomName(user.Section)
	if primaryRoom == "" {
		primaryRoom = "general"
	}

	defer func() {
		hub.unregister <- c
		c.Close()
	}()

	hub.register <- c
	hub.join <- RoomJoin{Client: c, Room: primaryRoom}

	for {
		messageType, message, err := c.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		if messageType != websocket.TextMessage {
			continue
		}

		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("error: %v", err)
			continue
		}

		msg.Room = normalizeRoomName(msg.Room)

		if msg.Action == "join" {
			if msg.Room == "" {
				continue
			}
			hub.join <- RoomJoin{Client: c, Room: msg.Room}

			// Fetch and send history
			db, err := databases.NewDatabaseHelper()
			if err == nil {
				history, err := db.GetRecentMessages(msg.Room, 50)
				if err == nil {
					// Send in reverse order so oldest appears first in the chat UI
					for i := len(history) - 1; i >= 0; i-- {
						hMsg := history[i]
						roomStr, _ := hMsg["room"].(string)
						textStr, _ := hMsg["text"].(string)
						senderIDStr, _ := hMsg["sender_id"].(string)
						senderAliasStr, _ := hMsg["sender_alias"].(string)
						timestampStr, _ := hMsg["created_at"].(string)

						hPayload, _ := json.Marshal(Message{
							Action:      "message",
							Room:        roomStr,
							Text:        textStr,
							SenderID:    senderIDStr,
							SenderAlias: senderAliasStr,
							Timestamp:   timestampStr,
						})
						c.WriteMessage(websocket.TextMessage, hPayload)
					}
				}
			}
			continue
		}

		if msg.Action != "message" {
			continue
		}

		msg.Text = strings.TrimSpace(msg.Text)
		if msg.Room == "" || msg.Text == "" {
			continue
		}

		msg.SenderID = identity.ID
		msg.SenderAlias = identity.Alias
		msg.SenderSection = primaryRoom
		msg.Timestamp = time.Now().UTC().Format(time.RFC3339)

		// Save to Supabase
		db, err := databases.NewDatabaseHelper()
		if err == nil {
			go db.SaveChatMessage(msg.Room, msg.Text, msg.SenderID, msg.SenderAlias)
		}

		payload, err := json.Marshal(msg)
		if err != nil {
			log.Printf("error: %v", err)
			continue
		}

		hub.broadcast <- payload
	}
}

func buildAnonymousIdentity(user *types.User) anonymousIdentity {
	seed := user.RegNumber
	if seed == "" {
		seed = user.Name + ":" + user.Section
	}
	sum := sha1.Sum([]byte(seed))
	short := strings.ToUpper(hex.EncodeToString(sum[:])[:4])
	section := normalizeRoomName(user.Section)
	if section == "" {
		section = "general"
	}

	return anonymousIdentity{
		ID:    hex.EncodeToString(sum[:8]),
		Alias: strings.ToUpper(section) + " · " + short,
	}
}

func normalizeRoomName(room string) string {
	normalized := strings.TrimSpace(strings.ToLower(room))
	if normalized == "" {
		return ""
	}

	replacer := strings.NewReplacer(" ", "-", "/", "-", "_", "-", ".", "-")
	return replacer.Replace(normalized)
}
