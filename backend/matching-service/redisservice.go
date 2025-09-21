package main

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
)

type RedisMatchingService struct {
	client *redis.Client
	ctx    context.Context
}

// User represents a user waiting to be matched
type User struct {
	ID         string     `json:"id"`
	Username   string     `json:"username"`
	Topics     []Topic    `json:"topics"`
	Difficulty Difficulty `json:"difficulty"`
	JoinedAt   time.Time  `json:"joined_at"`
	Priority   int        `json:"priority"` // Higher number = higher priority
	Language   string     `json:"language,omitempty"`
	Rating     int        `json:"rating,omitempty"`
}

// Match represents a successful match between two users
type Match struct {
	ID         string     `json:"id"`
	User1      User       `json:"user1"`
	User2      User       `json:"user2"`
	Topics     []Topic    `json:"topics"`
	Difficulty Difficulty `json:"difficulty"`
	MatchedAt  time.Time  `json:"matched_at"`
	RoomID     string     `json:"room_id"`
}

func NewRedisMatchingService() *RedisMatchingService {
	rdb := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password
		DB:       0,  // use default DB
	})

	return &RedisMatchingService{
		client: rdb,
		ctx:    context.Background(),
	}
}

// AddUser adds user to Redis queues
func (rms *RedisMatchingService) AddUser(user *User) error {
	// Store user details with TTL
	userKey := fmt.Sprintf("user:%s", user.ID)
	userData, _ := json.Marshal(user)

	err := rms.client.HSet(rms.ctx, userKey, map[string]interface{}{
		"data": userData,
	}).Err()
	if err != nil {
		return err
	}

	// Set TTL for automatic cleanup
	rms.client.Expire(rms.ctx, userKey, time.Hour)

	// Add to priority queues for each topic-difficulty
	for _, topic := range user.Topics {
		queueKey := fmt.Sprintf("queue:%s-%s", topic, user.Difficulty)

		// Use sorted set with priority as score, timestamp as member
		score := float64(user.Priority*1000000) + float64(time.Now().UnixNano()/1000)
		member := user.ID

		err := rms.client.ZAdd(rms.ctx, queueKey, &redis.Z{
			Score:  score,
			Member: member,
		}).Err()
		if err != nil {
			return err
		}
	}

	// Try to find matches
	go rms.tryMatch(user)

	return nil
}

// tryMatch finds matches using Redis operations
func (rms *RedisMatchingService) tryMatch(user *User) {
	for _, topic := range user.Topics {
		queueKey := fmt.Sprintf("queue:%s-%s", topic, user.Difficulty)

		// Get top 2 users from queue (excluding current user)
		users, err := rms.client.ZRevRangeByScore(rms.ctx, queueKey, &redis.ZRangeBy{
			Min:    "-inf",
			Max:    "+inf",
			Offset: 0,
			Count:  2,
		}).Result()

		if err != nil || len(users) < 2 {
			continue
		}

		// Check if we have a valid match
		var matchUserID string
		for _, userID := range users {
			if userID != user.ID {
				matchUserID = userID
				break
			}
		}

		if matchUserID != "" {
			// Create match
			match := Match{
				ID:         fmt.Sprintf("match-%d", time.Now().UnixNano()),
				User1:      *user,
				User2:      User{ID: matchUserID}, // Load full user data
				Topics:     []Topic{topic},
				Difficulty: user.Difficulty,
				MatchedAt:  time.Now(),
				RoomID:     fmt.Sprintf("room-%d", time.Now().UnixNano()),
			}

			// Remove both users from all queues
			rms.removeUserFromQueues(user.ID)
			rms.removeUserFromQueues(matchUserID)

			// Publish match event
			matchData, _ := json.Marshal(match)
			rms.client.Publish(rms.ctx, "matches", matchData)

			return
		}
	}
}

func (rms *RedisMatchingService) removeUserFromQueues(userID string) {
	// Get all queue keys
	keys, _ := rms.client.Keys(rms.ctx, "queue:*").Result()

	for _, key := range keys {
		rms.client.ZRem(rms.ctx, key, userID)
	}

	// Remove user data
	rms.client.Del(rms.ctx, fmt.Sprintf("user:%s", userID))
}
