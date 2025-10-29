package handlers

import (
	"matching-service/internal/models"
	"matching-service/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *services.MatchingService
}

func RegisterRoutes(router *gin.Engine, service *services.MatchingService) {
	h := &Handler{service: service}

	api := router.Group("/match")
	{
		api.POST("/request", h.RequestMatch)
		api.GET("/status/:id", h.MatchStatus) // example extension
		api.GET("/status/by-user/:userId", h.MatchStatusByUser)
		api.GET("/queue", h.GetQueue)
		api.DELETE("/cancel/:id", h.CancelMatch)
		api.DELETE("/cancel/by-user/:userId", h.CancelMatchByUser)
	}
}

func (h *Handler) RequestMatch(c *gin.Context) {
	var req models.MatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := h.service.RequestMatch(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (h *Handler) MatchStatus(c *gin.Context) {
	id := c.Param("id")
	res, err := h.service.CheckMatchStatus(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *Handler) MatchStatusByUser(c *gin.Context) {
	userId := c.Param("userId")
	status, details, err := h.service.CheckUserStatus(c.Request.Context(), userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	switch status {
	case 2:
		c.JSON(http.StatusOK, gin.H{"status": 2, "matchId": details["matchId"]})
	case 1:
		c.JSON(http.StatusOK, gin.H{"status": 1, "queue": details["queue"], "position": details["position"]})
	default:
		c.JSON(http.StatusOK, gin.H{"status": 0})
	}
}

func (h *Handler) CancelMatch(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.CancelMatch(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "cancelled"})
}

func (h *Handler) CancelMatchByUser(c *gin.Context) {
	userId := c.Param("userId")
	state, res, err := h.service.CancelByUser(c.Request.Context(), userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": state, "matchId": res.MatchID})
}

func (h *Handler) GetQueue(c *gin.Context) {
	users, err := h.service.GetQueueUsers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}
