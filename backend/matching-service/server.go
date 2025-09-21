package main

import (
	"crypto/rand"
	"math/big"

	"github.com/gin-gonic/gin"
)

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

func main() {
	router := gin.Default()
	router.POST("/match/request", enterQueue)
	router.GET("/match/status/:matchId", checkQueueStatus)
	router.DELETE("/match/cancel/:matchId", deleteUserFromQueue)
	router.Run("localhost:8080")
}
