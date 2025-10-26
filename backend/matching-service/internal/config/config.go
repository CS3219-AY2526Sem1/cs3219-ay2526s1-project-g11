package config

import "os"

type Config struct {
	Port               string
	RedisURL           string
	UserServiceURL     string
	QuestionServiceURL string
}

func Load() Config {
	return Config{
		Port:               getEnv("PORT", "8080"),
		RedisURL:           getEnv("REDIS_URL", "localhost:6379"),
		UserServiceURL:     getEnv("USER_SERVICE_URL", "http://localhost:3001"),
		QuestionServiceURL: getEnv("QUESTION_SERVICE_URL", "http://localhost:8080"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
