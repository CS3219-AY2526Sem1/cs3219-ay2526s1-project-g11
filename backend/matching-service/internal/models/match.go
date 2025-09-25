package models

type MatchRequest struct {
	Topics     []string `json:"topics"`
	Difficulty string   `json:"difficulty"`
	UserID     string   `json:"userId"`
}

type MatchResponse struct {
	MatchID   string `json:"matchId,omitempty"`
	PartnerID string `json:"partnerId,omitempty"`
	Status    string `json:"status"`
}
