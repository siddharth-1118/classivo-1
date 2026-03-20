package chat

import (
	"encoding/json"
	"sync"

	"github.com/gofiber/websocket/v2"
)

type RoomJoin struct {
	Client *websocket.Conn
	Room   string
}

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	clients map[*websocket.Conn]bool

	// Inbound messages from the clients.
	broadcast chan []byte

	// Register requests from the clients.
	register chan *websocket.Conn

	// Unregister requests from clients.
	unregister chan *websocket.Conn

	// Join requests from clients.
	join chan RoomJoin

	// Rooms is a map of room names to a map of clients.
	rooms map[string]map[*websocket.Conn]bool

	// Mutex for rooms map
	mu sync.RWMutex
}

func newHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
		join:       make(chan RoomJoin),
		clients:    make(map[*websocket.Conn]bool),
		rooms:      make(map[string]map[*websocket.Conn]bool),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
		case join := <-h.join:
			h.mu.Lock()
			if _, ok := h.rooms[join.Room]; !ok {
				h.rooms[join.Room] = make(map[*websocket.Conn]bool)
			}
			h.rooms[join.Room][join.Client] = true
			h.mu.Unlock()
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				client.Close()
				// Remove the client from any rooms they were in
				h.mu.Lock()
				for room := range h.rooms {
					delete(h.rooms[room], client)
				}
				h.mu.Unlock()
			}
		case message := <-h.broadcast:
			// Parse the message to get the room
			var msg Message
			if err := json.Unmarshal(message, &msg); err != nil {
				continue
			}

			// Special case for campus room
			if msg.Room == "campus" {
				for client := range h.clients {
					if err := client.WriteMessage(websocket.TextMessage, message); err != nil {
						// Handle error, maybe unregister client
					}
				}
				continue
			}

			// Send the message to the appropriate room
			h.mu.RLock()
			if room, ok := h.rooms[msg.Room]; ok {
				for client := range room {
					if err := client.WriteMessage(websocket.TextMessage, message); err != nil {
						// Handle error, maybe unregister client
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

// GetActiveRooms returns a list of room names that currently have at least one client.
func (h *Hub) GetActiveRooms() []string {
	h.mu.RLock()
	defer h.mu.RUnlock()
	rooms := []string{}
	for room := range h.rooms {
		rooms = append(rooms, room)
	}
	// Always include campus
	hasCampus := false
	for _, r := range rooms {
		if r == "campus" {
			hasCampus = true
			break
		}
	}
	if !hasCampus {
		rooms = append(rooms, "campus")
	}
	return rooms
}

// Exported instance for use in main.go
var GlobalHub = hub
