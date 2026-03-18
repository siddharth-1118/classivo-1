package globals

import "sync"

var (
	DevMode        bool = true
	ActiveSessions sync.Map
)
