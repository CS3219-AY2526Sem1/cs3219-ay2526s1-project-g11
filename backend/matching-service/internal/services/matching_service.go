package services

import (
	"context"
	"fmt"
	"matching-service/internal/models"
	"matching-service/internal/repository"
	"sort"
	"strings"
	"time"
)

type MatchingService struct {
	repo         *repository.MatchRepository
	userRepo     *repository.UserRepository
	questionRepo *repository.QuestionRepository
}

const defaultTTL = 10 * time.Minute

func buildQueueKey(topics []string, difficulty string) (joined string, queueKey string) {
	copyTopics := append([]string{}, topics...)
	sort.Strings(copyTopics)
	joined = strings.Join(copyTopics, ",")
	queueKey = fmt.Sprintf("queue:%s:%s", joined, difficulty)
	return
}

func NewMatchingService(repo *repository.MatchRepository, userRepo *repository.UserRepository, questionRepo *repository.QuestionRepository) *MatchingService {
	return &MatchingService{
		repo:         repo,
		userRepo:     userRepo,
		questionRepo: questionRepo,
	}
}

// selectQuestion tries to find a suitable question for the matched users with progressive sampling
func (s *MatchingService) selectQuestion(ctx context.Context, user1ID, user2ID string, topics []string, difficulty string) (string, error) {
	// Fetch completed questions for both users
	user1Completed, err := s.userRepo.GetCompletedQuestions(ctx, user1ID)
	if err != nil {
		// If we can't fetch completed questions, just proceed without filtering
		user1Completed = []string{}
	}

	user2Completed, err := s.userRepo.GetCompletedQuestions(ctx, user2ID)
	if err != nil {
		user2Completed = []string{}
	}

	// Create a set of questions completed by both users
	user1Set := make(map[string]bool)
	for _, qid := range user1Completed {
		user1Set[qid] = true
	}

	user2Set := make(map[string]bool)
	for _, qid := range user2Completed {
		user2Set[qid] = true
	}

	// Try progressive sampling: 10, 50, 100
	sampleSizes := []int{10, 50, 100}

	// Try to find a question neither user has completed
	for _, size := range sampleSizes {
		// Query question service with the first topic (matching service stores multiple topics, but question service queries by single tag)
		tag := topics[0]
		questions, err := s.questionRepo.GetQuestionsByDifficultyAndTag(ctx, difficulty, tag, size)
		if err != nil {
			continue // Try next sample size
		}

		// Filter questions: prioritize questions neither user has completed
		for _, q := range questions {
			if !user1Set[q.ID] && !user2Set[q.ID] {
				return q.ID, nil
			}
		}
	}

	// Fallback: Allow questions where only ONE user has completed it
	for _, size := range sampleSizes {
		tag := topics[0]
		questions, err := s.questionRepo.GetQuestionsByDifficultyAndTag(ctx, difficulty, tag, size)
		if err != nil {
			continue
		}

		for _, q := range questions {
			// Accept if only one user completed it (not both)
			if !(user1Set[q.ID] && user2Set[q.ID]) {
				return q.ID, nil
			}
		}
	}

	// Final fallback: return "no_suitable_question" status
	return "", fmt.Errorf("no_suitable_question")
}

func (s *MatchingService) RequestMatch(ctx context.Context, req models.MatchRequest) (*models.MatchResponse, error) {
	joined, queueKey := buildQueueKey(req.Topics, req.Difficulty)
	if err := s.repo.Enqueue(ctx, queueKey, req.UserID); err != nil {
		return nil, err
	}
	// Save user's queue association so we can report waiting status by userId
	_ = s.repo.SaveUserQueue(ctx, req.UserID, queueKey, defaultTTL)

	users, err := s.repo.PopTwo(ctx, queueKey)
	if err != nil {
		return nil, err
	}

	if len(users) < 2 {
		return &models.MatchResponse{Status: "waiting"}, nil
	}

	// Select a suitable question for the matched users
	questionID, err := s.selectQuestion(ctx, users[0], users[1], req.Topics, req.Difficulty)
	if err != nil {
		// If no suitable question found, return status indicating this
		return &models.MatchResponse{
			Status: "no_suitable_question",
		}, nil
	}

	matchID := fmt.Sprintf("match:%s:%d", joined, time.Now().UnixNano())
	// Save match with questionID
	if err := s.repo.SaveMatch(ctx, matchID, users[1], questionID, defaultTTL); err != nil {
		return nil, err
	}
	// Save reverse lookup so either user can poll by userId
	if err := s.repo.SaveUserMatch(ctx, users[0], matchID, defaultTTL); err != nil {
		return nil, err
	}
	if err := s.repo.SaveUserMatch(ctx, users[1], matchID, defaultTTL); err != nil {
		return nil, err
	}
	return &models.MatchResponse{
		MatchID:    matchID,
		PartnerID:  users[1],
		QuestionID: questionID,
		Status:     "matched",
	}, nil
}

func (s *MatchingService) CheckMatchStatus(ctx context.Context, matchID string) (*models.MatchResponse, error) {
	match, err := s.repo.GetMatch(ctx, matchID)
	if err != nil {
		return nil, err
	}
	return match, nil
}

func (s *MatchingService) CancelMatch(ctx context.Context, matchID string) error {
	return s.repo.CancelMatch(ctx, matchID)
}

func (s *MatchingService) CheckUserMatch(ctx context.Context, userID string) (string, error) {
	return s.repo.GetUserMatch(ctx, userID)
}

// CancelByUser cancels either a waiting user (removes from queue) or a matched user (removes match and mappings)
func (s *MatchingService) CancelByUser(ctx context.Context, userID string) (string, *models.MatchResponse, error) {
	if matchID, err := s.repo.GetUserMatch(ctx, userID); err == nil && matchID != "" {
		// Matched case: remove match and both user mappings
		if err := s.repo.CancelMatch(ctx, matchID); err != nil {
			return "", nil, err
		}
		// Best-effort: remove user match mappings (ignore errors)
		_ = s.repo.SaveUserMatch(ctx, userID, "", 0)
		return "cancelled_matched", &models.MatchResponse{MatchID: matchID, Status: "cancelled"}, nil
	}
	if queueKey, err := s.repo.GetUserQueue(ctx, userID); err == nil && queueKey != "" {
		if err := s.repo.RemoveFromQueue(ctx, queueKey, userID); err != nil {
			return "", nil, err
		}
		// Best-effort: clear queue mapping
		_ = s.repo.SaveUserQueue(ctx, userID, "", 0)
		return "cancelled_waiting", &models.MatchResponse{Status: "cancelled"}, nil
	}
	return "not_found", &models.MatchResponse{Status: "not_found"}, nil
}

// CheckUserStatus returns (statusCode, details)
// status 2: matched -> details["matchId"]
// status 1: waiting -> details["queue"], details["position"] (0-based)
// status 0: not in queue and not matched
func (s *MatchingService) CheckUserStatus(ctx context.Context, userID string) (int, map[string]any, error) {
	if matchID, err := s.repo.GetUserMatch(ctx, userID); err == nil && matchID != "" {
		return 2, map[string]any{"matchId": matchID}, nil
	}
	queueKey, err := s.repo.GetUserQueue(ctx, userID)
	if err == nil && queueKey != "" {
		rank, rerr := s.repo.GetUserQueueRank(ctx, queueKey, userID)
		if rerr != nil {
			return 1, map[string]any{"queue": queueKey}, nil
		}
		if rank >= 0 {
			return 1, map[string]any{"queue": queueKey, "position": rank}, nil
		}
	}
	return 0, nil, nil
}

// GetQueueUsers returns all users currently in all queues
func (s *MatchingService) GetQueueUsers(ctx context.Context) ([]models.QueueUser, error) {
	queueUsers, err := s.repo.GetAllQueueUsers(ctx)
	if err != nil {
		return nil, err
	}

	var result []models.QueueUser
	for queueKey, users := range queueUsers {
		// Parse queue key to extract topics and difficulty
		// Format: "queue:topic1,topic2:difficulty"
		parts := strings.Split(queueKey, ":")
		if len(parts) != 3 || parts[0] != "queue" {
			continue // Skip malformed queue keys
		}

		topics := strings.Split(parts[1], ",")
		difficulty := parts[2]

		// Add each user in this queue
		for _, userID := range users {
			result = append(result, models.QueueUser{
				UserID:     userID,
				Topics:     topics,
				Difficulty: difficulty,
			})
		}
	}

	return result, nil
}
