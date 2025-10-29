package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

type QuestionRepository struct {
	baseURL    string
	httpClient *http.Client
}

type Question struct {
	ID               string      `json:"id"`
	Title            string      `json:"title"`
	TitleSlug        string      `json:"titleSlug"`
	Difficulty       string      `json:"difficulty"`
	Question         string      `json:"question"`
	ExampleTestcases string      `json:"exampleTestcases"`
	TopicTags        []TopicTag  `json:"topicTags"`
}

type TopicTag struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}

func NewQuestionRepository(baseURL string) *QuestionRepository {
	return &QuestionRepository{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

// GetQuestionsByDifficultyAndTag fetches questions matching the given difficulty and tag with the specified sample size
func (r *QuestionRepository) GetQuestionsByDifficultyAndTag(ctx context.Context, difficulty, tag string, size int) ([]Question, error) {
	// Build query parameters
	params := url.Values{}
	params.Add("difficulty", difficulty)
	params.Add("tag", tag)
	params.Add("size", strconv.Itoa(size))

	url := fmt.Sprintf("%s/questions?%s", r.baseURL, params.Encode())

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := r.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call question service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusBadRequest {
		return nil, fmt.Errorf("invalid parameters: difficulty=%s, tag=%s", difficulty, tag)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("question service returned status %d", resp.StatusCode)
	}

	var questions []Question
	if err := json.NewDecoder(resp.Body).Decode(&questions); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return questions, nil
}
