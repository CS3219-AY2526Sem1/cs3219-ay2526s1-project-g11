package main

import (
	"crypto/rand"
	"log"
	"math/big"

	"github.com/gin-gonic/gin"
)

func healthCheck(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Matching service is running",
	})
}

func enterQueue(c *gin.Context) {
	id, err := rand.Int(rand.Reader, big.NewInt(9999))
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate ID"})
		return
	}
	c.JSON(200, gin.H{
		"message": "New session created in queue: " + id.String(),
	})
}

func checkQueueStatus(c *gin.Context) {
	matchId := c.Param("matchId")
	c.JSON(200, gin.H{
		"message": "You should see your id: " + matchId,
	})
}

func deleteUserFromQueue(c *gin.Context) {
	matchId := c.Param("matchId")
	c.JSON(200, gin.H{
		"message": "You should see your id: " + matchId,
	})
}

// setupRouter builds and returns the Gin engine with all routes.
func setupRouter() *gin.Engine {
	r := gin.Default()
	r.GET("/health", healthCheck)
	r.POST("/match/request", enterQueue)
	r.GET("/match/status/:matchId", checkQueueStatus)
	r.DELETE("/match/cancel/:matchId", deleteUserFromQueue)
	return r
}

func main() {
	router := setupRouter()
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
