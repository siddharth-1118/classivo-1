package chat

import (
	"encoding/json"
	"log"

	"goscraper/src/handlers"
	"goscraper/src/helpers/databases"

	"github.com/gofiber/websocket/v2"
)

// hub holds the active clients and broadcasts messages.
var hub = newHub()

func init() {
	go hub.run()
}

// Message is a struct to hold the message data
type Message struct {
	Action string `json:"action"` // "join" or "message"
	Room   string `json:"room"`
	Text   string `json:"text,omitempty"`
}

// ChatWebsocket handles websocket connections for the chat.
func ChatWebsocket(c *websocket.Conn) {
	// Get user profile
	token := c.Query("token")
	user, err := handlers.GetUser(token)
	if err != nil {
		log.Printf("error: %v", err)
		return
	}

	// When the function returns, unregister the client and close the connection.
	defer func() {
		hub.unregister <- c
		c.Close()
	}()

	// Register the client
	hub.register <- c

	// Add the client to their own section room initially
	hub.join <- RoomJoin{Client: c, Room: user.Section}

	for {
		// Read a message from the client
		messageType, message, err := c.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break // Breaks the loop on error
		}

		if messageType == websocket.TextMessage {
			// Parse the message
			var msg Message
			if err := json.Unmarshal(message, &msg); err != nil {
				log.Printf("error: %v", err)
				continue
			}

			if msg.Action == "join" {
				// User wants to join another room
				hub.join <- RoomJoin{Client: c, Room: msg.Room}
				continue
			}

			// If it's a message action
			// Save the message to the database
			db, err := databases.NewDatabaseHelper()
			if err != nil {
				log.Printf("error: %v", err)
				continue
			}
			if err := db.SaveMessage(msg.Room, msg.Text); err != nil {
				log.Printf("error: %v", err)
				continue
			}

			// Broadcast the received message
			hub.broadcast <- message
		}
	}
}
