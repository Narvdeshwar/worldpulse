package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/mmcdole/gofeed"
	"github.com/redis/go-redis/v9"
)

type NewsItem struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Summary   string `json:"summary"`
	Source    string `json:"source"`
	Timestamp string `json:"timestamp"`
	URL       string `json:"url"`
}

var (
	ctx         = context.Background()
	rdb         *redis.Client
	feedKey     = "wp:feed:latest"
	tickerKey   = "wp:ticker:latest"
	retention   = 48 * time.Hour
	// In-memory fallback
	memoryCache []byte
	tickerCache []byte
)

func initRedis() {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}
	rdb = redis.NewClient(&redis.Options{
		Addr: redisURL,
	})
	
	// Test connection
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Printf("⚠️ Redis unavailable at %s: Using in-memory fallback", redisURL)
		rdb = nil
	} else {
		log.Printf("✅ Connected to Redis at %s", redisURL)
	}
}

func sendWelcomeEmail(email string) {
	log.Printf("📧 [INTEL-MAIL] Sending welcome briefing to: %s", email)
	log.Printf("📧 [INTEL-MAIL] Content: Welcome to WorldPulse. Your first report arrives in 12 hours.")
}

func gatherIntelligence() {
	fp := gofeed.NewParser()
	feeds := []string{
		"http://feeds.bbci.co.uk/news/world/rss.xml",
		"https://www.nasa.gov/news-release/feed/",
		"https://www.wired.com/feed/rss",
		"https://techcrunch.com/category/artificial-intelligence/feed/",
	}

	for {
		log.Println("🌍 Synchronizing with global intelligence feeds...")
		
		type NewsWithTime struct {
			Item NewsItem
			Date time.Time
		}
		var itemsWithTime []NewsWithTime

		for _, url := range feeds {
			feed, err := fp.ParseURL(url)
			if err != nil {
				log.Printf("⚠️ Failed to parse feed %s: %v", url, err)
				continue
			}

			// Extract source name (e.g. "TechCrunch AI")
			sourceName := feed.Title
			if strings.Contains(strings.ToLower(url), "techcrunch") {
				sourceName = "TechCrunch AI"
			}

			// Record top 8 items from each node for density
			limit := 8
			if len(feed.Items) < limit {
				limit = len(feed.Items)
			}

			for i := 0; i < limit; i++ {
				item := feed.Items[i]
				
				// Parse date for ranking logic
				publishedAt := time.Now()
				if item.Published != "" {
					if t, err := time.Parse(time.RFC1123Z, item.Published); err == nil {
						publishedAt = t
					} else if t, err := time.Parse(time.RFC1123, item.Published); err == nil {
						publishedAt = t
					} else if t, err := time.Parse(time.RFC3339, item.Published); err == nil {
						publishedAt = t
					}
				}

				itemsWithTime = append(itemsWithTime, NewsWithTime{
					Item: NewsItem{
						ID:        item.GUID,
						Title:     item.Title,
						Summary:   item.Description,
						Source:    sourceName,
						Timestamp: item.Published,
						URL:       item.Link,
					},
					Date: publishedAt,
				})
			}
		}

		// 🕒 GLOBAL CHRONOLOGICAL SORT: Newest Intelligence First
		sort.Slice(itemsWithTime, func(i, j int) bool {
			return itemsWithTime[i].Date.After(itemsWithTime[j].Date)
		})

		var allItems []NewsItem
		var tickerStrings []string
		for _, it := range itemsWithTime {
			allItems = append(allItems, it.Item)
			if len(tickerStrings) < 15 {
				tickerStrings = append(tickerStrings, fmt.Sprintf("[%s] %s", it.Item.Source, it.Item.Title))
			}
		}

		if len(allItems) > 0 {
			data, _ := json.Marshal(allItems)
			tData, _ := json.Marshal(tickerStrings)

			if rdb != nil {
				rdb.Set(ctx, feedKey, data, retention)
				rdb.Set(ctx, tickerKey, tData, retention)
			}
			memoryCache = data
			tickerCache = tData
			log.Printf("✅ Pipeline synchronized: %d feed items, %d ticker items [Chronology Active]", len(allItems), len(tickerStrings))
		} else {
			log.Println("⚠️ Pipeline warning: No items retrieved from feeds.")
		}

		intervalStr := os.Getenv("INTELLIGENCE_INTERVAL")
		interval, err := time.ParseDuration(intervalStr)
		if err != nil {
			interval = 2 * time.Hour
		}
		
		log.Printf("💤 Next synchronization in %v", interval)
		time.Sleep(interval)
	}
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using defaults")
	}

	initRedis()
	go gatherIntelligence()

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	r.GET("/api/feed", func(c *gin.Context) {
		var data []byte

		if rdb != nil {
			data, _ = rdb.Get(ctx, feedKey).Bytes()
		} else {
			data = memoryCache
		}

		if len(data) == 0 {
			log.Printf("Pipeline miss: No data available")
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Intelligence pipeline initializing"})
			return
		}

		var feed []NewsItem
		json.Unmarshal(data, &feed)
		c.JSON(http.StatusOK, feed)
	})

	r.GET("/api/ticker", func(c *gin.Context) {
		var data []byte

		if rdb != nil {
			data, _ = rdb.Get(ctx, tickerKey).Bytes()
		} else {
			data = tickerCache
		}

		if len(data) == 0 {
			// Fallback mock for cold start
			tickerItems := []string{
				"CRITICAL: WorldPulse Intelligence Pipeline Initializing...",
				"SYNC: Establishing connection with global news nodes...",
				"FEED: BBC, NASA, and Wired status: OK",
			}
			c.JSON(http.StatusOK, tickerItems)
			return
		}

		var tickerItems []string
		json.Unmarshal(data, &tickerItems)
		c.JSON(http.StatusOK, tickerItems)
	})

	r.POST("/api/subscribe", func(c *gin.Context) {
		var body struct {
			Email string `json:"email"`
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
			return
		}

		if rdb != nil {
			rdb.SAdd(ctx, "wp:subscribers", body.Email)
		}
		
		go sendWelcomeEmail(body.Email)
		
		log.Printf("📩 New Subscriber Synchronized: %s", body.Email)
		c.JSON(http.StatusOK, gin.H{"message": "Subscribed! Initial report coming in 12 hours."})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("WorldPulse Intelligence Server live on port %s", port)
	r.Run(":" + port)
}
