package config

import (
	"os"
	"time"
)

type Config struct {
	RedisURL            string
	Port                string
	IntelligenceInterval time.Duration
	Retention           time.Duration
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}

	intervalStr := os.Getenv("INTELLIGENCE_INTERVAL")
	interval, err := time.ParseDuration(intervalStr)
	if err != nil {
		interval = 2 * time.Hour
	}

	return &Config{
		RedisURL:            redisURL,
		Port:                port,
		IntelligenceInterval: interval,
		Retention:           24 * time.Hour,
	}
}
