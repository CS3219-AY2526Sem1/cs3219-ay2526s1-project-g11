package repository

import (
	"context"
	"encoding/json"
	"log"
	"matching-service/internal/constants"
	"matching-service/internal/models"
	"strings"
	"time"

	"github.com/go-redis/redis/v8"
)

type MatchRepository struct {
	redis *redis.Client
}

func NewRedisClient(url string) *redis.Client {
	return redis.NewClient(&redis.Options{Addr: url})
}

func NewMatchRepository(redis *redis.Client) *MatchRepository {
	return &MatchRepository{redis: redis}
}

func (r *MatchRepository) Enqueue(ctx context.Context, queueKey, userID string) error {
	score := float64(time.Now().Unix())
	return r.redis.ZAdd(ctx, queueKey, &redis.Z{
		Score:  score,
		Member: userID,
	}).Err()
}

// SaveUserQueue stores a mapping from userID to their queueKey
func (r *MatchRepository) SaveUserQueue(ctx context.Context, userID, queueKey string, ttl time.Duration) error {
	key := strings.Join([]string{constants.UserKeyPrefix, userID, constants.UserQueueKeySuffix}, constants.QueueKeyDelimiter)
	return r.redis.Set(ctx, key, queueKey, ttl).Err()
}

// GetUserQueue fetches the queueKey for the given userID
func (r *MatchRepository) GetUserQueue(ctx context.Context, userID string) (string, error) {
	key := strings.Join([]string{constants.UserKeyPrefix, userID, constants.UserQueueKeySuffix}, constants.QueueKeyDelimiter)
	return r.redis.Get(ctx, key).Result()
}

// GetUserQueueRank returns the user's rank (0-based) within a queue, or -1 if not present
func (r *MatchRepository) GetUserQueueRank(ctx context.Context, queueKey, userID string) (int64, error) {
	rank, err := r.redis.ZRank(ctx, queueKey, userID).Result()
	if err == redis.Nil {
		return -1, nil
	}
	return rank, err
}

func (r *MatchRepository) PopTwo(ctx context.Context, queueKey string) ([]string, error) {
	// Only pop if at least 2 users are present; otherwise return empty and keep user(s) queued
	size, err := r.redis.ZCard(ctx, queueKey).Result()
	if err != nil {
		return nil, err
	}
	if size < 2 {
		return []string{}, nil
	}
	vals, err := r.redis.ZPopMin(ctx, queueKey, 2).Result()
	if err != nil {
		return nil, err
	}
	var users []string
	for _, v := range vals {
		users = append(users, v.Member.(string))
	}
	return users, nil
}

type MatchData struct {
	PartnerID  string `json:"partnerId"`
	QuestionID string `json:"questionId"`
}

func (r *MatchRepository) GetMatch(ctx context.Context, matchID string) (*models.MatchResponse, error) {
	matchJSON, err := r.redis.Get(ctx, matchID).Result()
	if err != nil {
		return nil, err
	}

	var matchData MatchData
	if err := json.Unmarshal([]byte(matchJSON), &matchData); err != nil {
		return nil, err
	}

	return &models.MatchResponse{
		MatchID:    matchID,
		UserIDs:    []string{matchData.PartnerID},
		QuestionID: matchData.QuestionID,
		Status:     "matched",
	}, nil
}

func (r *MatchRepository) CancelMatch(ctx context.Context, matchID string) error {
	return r.redis.Del(ctx, matchID).Err()
}

// RemoveFromQueue removes a user from the given queue
func (r *MatchRepository) RemoveFromQueue(ctx context.Context, queueKey, userID string) error {
	return r.redis.ZRem(ctx, queueKey, userID).Err()
}

// SaveMatch stores match data (partnerId and questionId) with a TTL so clients can poll.
func (r *MatchRepository) SaveMatch(ctx context.Context, matchID string, partnerID string, questionID string, ttl time.Duration) error {
	matchData := MatchData{
		PartnerID:  partnerID,
		QuestionID: questionID,
	}
	matchJSON, err := json.Marshal(matchData)
	if err != nil {
		return err
	}
	return r.redis.Set(ctx, matchID, matchJSON, ttl).Err()
}

// SaveUserMatch stores userId -> matchId with TTL so a user can poll by userId.
func (r *MatchRepository) SaveUserMatch(ctx context.Context, userID string, matchID string, ttl time.Duration) error {
	key := strings.Join([]string{constants.UserKeyPrefix, userID, constants.UserMatchIDKeySuffix}, constants.QueueKeyDelimiter)
	return r.redis.Set(ctx, key, matchID, ttl).Err()
}

// GetUserMatch returns the matchId for a given user, if present.
func (r *MatchRepository) GetUserMatch(ctx context.Context, userID string) (string, error) {
	key := strings.Join([]string{constants.UserKeyPrefix, userID, constants.UserMatchIDKeySuffix}, constants.QueueKeyDelimiter)
	return r.redis.Get(ctx, key).Result()
}

// GetAllQueues retrieves all queue information using SCAN for better performance
func (r *MatchRepository) GetAllQueues(ctx context.Context) ([]models.QueueInfo, error) {
	var cursor uint64
	var queues []models.QueueInfo
	queueMap := make(map[string]bool) // To track unique queues

	pattern := constants.QueueKeyPrefix + constants.QueueKeyDelimiter + "*"

	// Use SCAN instead of KEYS for better performance
	for {
		keys, newCursor, err := r.redis.Scan(ctx, cursor, pattern, constants.ScanBatchSize).Result()
		if err != nil {
			log.Printf("Error scanning Redis keys: %v", err)
			return nil, err
		}

		for _, queueKey := range keys {
			if queueMap[queueKey] {
				continue // Skip if already processed
			}
			queueMap[queueKey] = true

			// Parse queue key format
			parts := strings.Split(queueKey, constants.QueueKeyDelimiter)
			if len(parts) != constants.QueueKeyParts || parts[0] != constants.QueueKeyPrefix {
				log.Printf("Skipping malformed queue key: %s", queueKey)
				continue
			}

			// Get queue size
			size, err := r.redis.ZCard(ctx, queueKey).Result()
			if err != nil {
				log.Printf("Error getting size for queue %s: %v", queueKey, err)
				continue // Log error but continue processing other queues
			}

			queues = append(queues, models.QueueInfo{
				Key:        queueKey,
				Difficulty: parts[1],
				Topics:     parts[2],
				Size:       size,
			})
		}

		cursor = newCursor
		if cursor == 0 {
			break // Scan complete
		}
	}

	return queues, nil
}

// GetAllQueueUsers returns all users currently in all queues
func (r *MatchRepository) GetAllQueueUsers(ctx context.Context) (map[string][]string, error) {
	var cursor uint64
	queueUsers := make(map[string][]string)
	pattern := constants.QueueKeyPrefix + constants.QueueKeyDelimiter + "*"

	// Use SCAN instead of KEYS for better performance
	for {
		keys, newCursor, err := r.redis.Scan(ctx, cursor, pattern, constants.ScanBatchSize).Result()
		if err != nil {
			log.Printf("Error scanning Redis keys: %v", err)
			return nil, err
		}

		for _, queueKey := range keys {
			// Get all users in this queue
			users, err := r.redis.ZRange(ctx, queueKey, 0, -1).Result()
			if err != nil {
				log.Printf("Error getting users for queue %s: %v", queueKey, err)
				continue // Skip this queue if there's an error
			}
			queueUsers[queueKey] = users
		}

		cursor = newCursor
		if cursor == 0 {
			break // Scan complete
		}
	}

	return queueUsers, nil
}
