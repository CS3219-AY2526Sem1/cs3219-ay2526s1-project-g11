package config

import "os"

type Config struct {
	Port     string
	RedisURL string
}

func Load() Config {
	return Config{
		Port:     getEnv("PORT", "8080"),
		RedisURL: getEnv("REDIS_URL", "localhost:6379"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
