package repository

import (
	"context"
	"matching-service/internal/models"
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
	return r.redis.Set(ctx, "user:"+userID+":queue", queueKey, ttl).Err()
}

// GetUserQueue fetches the queueKey for the given userID
func (r *MatchRepository) GetUserQueue(ctx context.Context, userID string) (string, error) {
	return r.redis.Get(ctx, "user:"+userID+":queue").Result()
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

func (r *MatchRepository) GetMatch(ctx context.Context, matchID string) (*models.MatchResponse, error) {
	match, err := r.redis.Get(ctx, matchID).Result()
	if err != nil {
		return nil, err
	}
	return &models.MatchResponse{
		MatchID:   matchID,
		PartnerID: match,
		Status:    "matched",
	}, nil
}

func (r *MatchRepository) CancelMatch(ctx context.Context, matchID string) error {
	return r.redis.Del(ctx, matchID).Err()
}

// RemoveFromQueue removes a user from the given queue
func (r *MatchRepository) RemoveFromQueue(ctx context.Context, queueKey, userID string) error {
	return r.redis.ZRem(ctx, queueKey, userID).Err()
}

// SaveMatch stores a matchID -> partnerID mapping with a TTL so clients can poll.
func (r *MatchRepository) SaveMatch(ctx context.Context, matchID string, partnerID string, ttl time.Duration) error {
	return r.redis.Set(ctx, matchID, partnerID, ttl).Err()
}

// SaveUserMatch stores userId -> matchId with TTL so a user can poll by userId.
func (r *MatchRepository) SaveUserMatch(ctx context.Context, userID string, matchID string, ttl time.Duration) error {
	return r.redis.Set(ctx, "user:"+userID+":matchId", matchID, ttl).Err()
}

// GetUserMatch returns the matchId for a given user, if present.
func (r *MatchRepository) GetUserMatch(ctx context.Context, userID string) (string, error) {
	return r.redis.Get(ctx, "user:"+userID+":matchId").Result()
}
