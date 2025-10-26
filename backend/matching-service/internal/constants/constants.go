package constants

// Redis key format constants
const (
	QueueKeyPrefix       = "queue"
	QueueKeyDelimiter    = ":"
	QueueKeyParts        = 3
	UserKeyPrefix        = "user"
	UserQueueKeySuffix   = "queue"
	UserMatchIDKeySuffix = "matchId"
)

// Redis scan constants
const (
	ScanBatchSize = 100 // Number of keys to scan per iteration
)
