package globals

import "sync"

var (
	DevMode        bool = false
	ActiveSessions sync.Map
)
