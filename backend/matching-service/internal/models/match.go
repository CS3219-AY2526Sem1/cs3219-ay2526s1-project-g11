package models

type MatchRequest struct {
	Topics     []string `json:"topics"`
	Difficulty string   `json:"difficulty"`
	UserID     string   `json:"userId"`
}

type MatchResponse struct {
	MatchID    string   `json:"matchId,omitempty"`
	UserIDs    []string `json:"userIds,omitempty"`
	QuestionID string   `json:"questionId,omitempty"`
	Status     string   `json:"status"`
}

type QueueInfo struct {
	Key        string `json:"key"`
	Difficulty string `json:"difficulty"`
	Topics     string `json:"topics"`
	Size       int64  `json:"size"`
}

type QueueUser struct {
	UserID     string   `json:"userId"`
	Topics     []string `json:"topics"`
	Difficulty string   `json:"difficulty"`
}
