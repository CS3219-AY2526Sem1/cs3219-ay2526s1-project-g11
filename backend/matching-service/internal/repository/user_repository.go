package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type UserRepository struct {
	baseURL    string
	httpClient *http.Client
}

type CompletedQuestionsResponse struct {
	Message string   `json:"message"`
	Data    []string `json:"data"`
}

func NewUserRepository(baseURL string) *UserRepository {
	return &UserRepository{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// GetCompletedQuestions fetches the list of completed question IDs for a given user
func (r *UserRepository) GetCompletedQuestions(ctx context.Context, userID string) ([]string, error) {
	url := fmt.Sprintf("%s/users/%s/completed-questions", r.baseURL, userID)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := r.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call user service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, fmt.Errorf("user %s not found", userID)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("user service returned status %d", resp.StatusCode)
	}

	var result CompletedQuestionsResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return result.Data, nil
}
