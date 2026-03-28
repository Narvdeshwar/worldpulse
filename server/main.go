package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

type NewsItem struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Summary   string `json:"summary"`
	Source    string `json:"source"`
	Timestamp string `json:"timestamp"`
}

var (
	ctx         = context.Background()
	rdb         *redis.Client
	feedKey     = "wp:feed:latest"
	retention   = 48 * time.Hour
)

func initRedis() {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}
	rdb = redis.NewClient(&redis.Options{
		Addr: redisURL,
	})
	log.Printf("Connecting to Redis at %s", redisURL)
}

// simulateIntelligenceGathering periodically updates the feed in Redis
func simulateIntelligenceGathering() {
	for {
		log.Println("🌍 Gathering intelligence from global sources...")
		
		mockFeed := []NewsItem{
			{
				ID:        "1",
				Title:     "OpenAI Announces Strawberry-1 Model",
				Summary:   "The new model focuses on reasoning and has shown significant improvements in complex problem-solving tasks, particularly in coding and math. It marks a shift towards agentic behavior in LLMs.",
				Source:    "OpenAI / xAI",
				Timestamp: "2h ago",
			},
			{
				ID:        "2",
				Title:     "NVIDIA's Blackwell Chips Enter Mass Production",
				Summary:   "Supply chain reports indicate that NVIDIA has secured massive orders for its next-gen AI chips. Production is scaling faster than expected to meet demand from cloud providers.",
				Source:    "Bloomberg",
				Timestamp: "5h ago",
			},
			{
				ID:        "3",
				Title:     "SpaceX Starship Completes Fifth Test Flight",
				Summary:   "The flight demonstrated successful stage separation and a controlled landing of the Super Heavy booster back at the launch site, a critical milestone for full reuse.",
				Source:    "SpaceNews",
				Timestamp: "12h ago",
			},
		}

		data, _ := json.Marshal(mockFeed)
		err := rdb.Set(ctx, feedKey, data, retention).Err()
		if err != nil {
			log.Printf("Error saving to Redis: %v", err)
		}

		time.Sleep(6 * time.Hour) // Gather every 6 hours
	}
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using defaults")
	}

	initRedis()
	go simulateIntelligenceGathering()

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		c.Next()
	})

	r.GET("/api/feed", func(c *gin.Context) {
		val, err := rdb.Get(ctx, feedKey).Result()
		if err != nil {
			log.Printf("Redis miss: %v", err)
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Intelligence pipeline initializing"})
			return
		}

		var feed []NewsItem
		json.Unmarshal([]byte(val), &feed)
		c.JSON(http.StatusOK, feed)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("WorldPulse Intelligence Server live on port %s", port)
	r.Run(":" + port)
}
