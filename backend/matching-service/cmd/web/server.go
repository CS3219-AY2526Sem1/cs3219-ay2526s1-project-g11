package main

import (
	"log"
	"os"

	"matching-service/internal/config"
	"matching-service/internal/handlers"
	"matching-service/internal/repository"
	"matching-service/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func root(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Matching service is running",
	})
}

func healthCheck(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Matching service is running",
	})
}

// setupRouter builds and returns the Gin engine with all routes.
func setupRouter() *gin.Engine {
	r := gin.Default()
	r.GET("/", root)
	r.GET("/health", healthCheck)
	return r
}

func main() {
	cfg := config.Load()
	redisClient := repository.NewRedisClient(cfg.RedisURL)
	repo := repository.NewMatchRepository(redisClient)
	service := services.NewMatchingService(repo)

	_ = godotenv.Load(".env") // non-fatal if missing
	appEnv := os.Getenv("APP_ENV")
	if appEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	log.Println("APP_ENV: " + appEnv)
	router := setupRouter()
	handlers.RegisterRoutes(router, service)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("listening on :%s", port)
	if err := router.Run("0.0.0.0:" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
