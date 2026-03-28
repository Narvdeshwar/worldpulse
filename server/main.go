package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type NewsItem struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Summary   string `json:"summary"`
	Source    string `json:"source"`
	Timestamp string `json:"timestamp"`
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using defaults")
	}

	// Set up Gin
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		c.Next()
	})

	// API Endpoint for the intelligence feed
	r.GET("/api/feed", func(c *gin.Context) {
		// Mock data for now
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
		}
		c.JSON(http.StatusOK, mockFeed)
	})

	// Server port
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("WorldPulse Intelligence Server starting on port %s", port)
	r.Run(":" + port)
}
