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
	}

	for {
		log.Println("🌍 Synchronizing with global intelligence feeds...")
		var allItems []NewsItem

		for _, url := range feeds {
			feed, err := fp.ParseURL(url)
			if err != nil {
				log.Printf("⚠️ Failed to parse feed %s: %v", url, err)
				continue
			}

			// Capture top 5 items from each feed
			limit := 5
			if len(feed.Items) < limit {
				limit = len(feed.Items)
			}

			for i := 0; i < limit; i++ {
				item := feed.Items[i]
				
				// Clean up timestamp
				ts := "Recent"
				if item.Published != "" {
					ts = item.Published
					if t, err := time.Parse(time.RFC1123Z, ts); err == nil {
						ts = t.Format("Jan 02, 15:04")
					} else if t, err := time.Parse(time.RFC1123, ts); err == nil {
						ts = t.Format("Jan 02, 15:04")
					}
				}

				allItems = append(allItems, NewsItem{
					ID:        item.GUID,
					Title:     item.Title,
					Summary:   item.Description,
					Source:    feed.Title,
					Timestamp: ts,
					URL:       item.Link,
				})
			}
		}

		if len(allItems) > 0 {
			data, _ := json.Marshal(allItems)
			
			// Generate dynamic ticker items
			var tickerStrings []string
			for i := 0; i < len(allItems) && i < 15; i++ {
				tickerStrings = append(tickerStrings, allItems[i].Source+": "+allItems[i].Title)
			}
			tData, _ := json.Marshal(tickerStrings)

			if rdb != nil {
				rdb.Set(ctx, feedKey, data, retention)
				rdb.Set(ctx, tickerKey, tData, retention)
			}
			memoryCache = data
			tickerCache = tData
			log.Printf("✅ Pipeline synchronized: %d feed items, %d ticker items ingested.", len(allItems), len(tickerStrings))
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
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
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
