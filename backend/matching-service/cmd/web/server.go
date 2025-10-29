package main

import (
	"log"
	"os"

	"matching-service/internal/config"
	"matching-service/internal/handlers"
	"matching-service/internal/repository"
	"matching-service/internal/services"

	"github.com/gin-contrib/cors"
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

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

// setupRouter builds and returns the Gin engine with all routes.
func setupRouter() *gin.Engine {
	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"}, // Allow all origins for development
		// For production, replace with specific origins:
		// AllowOrigins:     []string{"http://localhost:3000", "https://your-frontend-domain.com"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 3600, // 12 hours
	}))

	r.GET("/", root)
	r.GET("/health", healthCheck)
	return r
}

func main() {
	cfg := config.Load()
	redisClient := repository.NewRedisClient(cfg.RedisURL)
	repo := repository.NewMatchRepository(redisClient)
	userRepo := repository.NewUserRepository(cfg.UserServiceURL)
	questionRepo := repository.NewQuestionRepository(cfg.QuestionServiceURL)
	service := services.NewMatchingService(repo, userRepo, questionRepo)

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
