package main

import (
	"context"
	"encoding/json"
	"fmt"
	"html"
	"log"
	"net/http"
	"os"
	"regexp"
	"sort"
	"strings"
	"sync"
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
	ctx       = context.Background()
	rdb       *redis.Client
	feedKey   = "wp:feed:latest"
	tickerKey = "wp:ticker:latest"
	retention = 48 * time.Hour

	// 🔒 THREAD-SAFE CACHE LAYER (Staff Engineer Hardening)
	cacheLock   sync.RWMutex
	memoryCache []byte
	tickerCache []byte

	// 🕒 GLOBAL DATE LAYOUTS (Pre-allocated for performance)
	dateLayouts = []string{
		time.RFC1123Z,
		time.RFC1123,
		time.RFC3339,
		time.RFC822,
		time.RFC822Z,
		time.RFC850,
		time.ANSIC,
		"Mon, 02 Jan 2006 15:04:05 MST",
		"Mon, 02 Jan 2006 15:04:05 -0700",
		"02 Jan 2006 15:04:05 MST",
		"02 Jan 2006 15:04:05 -0700",
		"Mon, 2 Jan 2006 15:04:05 MST",
		"Mon, 2 Jan 2006 15:04:05 -0700",
		"2006-01-02 15:04:05",
		"January 02, 2006 15:04:05",
	}
)

func initRedis() {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}
	rdb = redis.NewClient(&redis.Options{
		Addr: redisURL,
	})
	
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Printf("⚠️ Redis unavailable at %s: Using in-memory fallback", redisURL)
		rdb = nil
	} else {
		log.Printf("✅ Connected to Redis at %s", redisURL)
	}
}

func sendWelcomeEmail(email string) {
	log.Printf("📧 [INTEL-MAIL] Sending tactical briefing to: %s [06:00/18:00 window]", email)
}

func gatherIntelligence() {
	fp := gofeed.NewParser()
	fp.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 WorldPulse/1.1"

	feeds := []string{
		"http://feeds.bbci.co.uk/news/world/rss.xml",
		"https://www.nasa.gov/news-release/feed/",
		"https://www.wired.com/feed/rss",
		"https://techcrunch.com/category/artificial-intelligence/feed/",
		"https://venturebeat.com/category/ai/feed/",
		"https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
		"https://www.zdnet.com/topic/artificial-intelligence/rss.xml",
		"https://www.aljazeera.com/xml/rss/all.xml",
		"https://www.theguardian.com/world/rss",
	}

	for {
		log.Println("🌍 SYNCHRONIZING: Refreshing Global Tactical Grid...")
		
		type NewsWithTime struct {
			Item NewsItem
			Date time.Time
		}
		var itemsWithTime []NewsWithTime

		for _, url := range feeds {
			log.Printf("📡 NODE-CHECK: Attempting sync with %s...", url)
			feed, err := fp.ParseURL(url)
			if err != nil {
				log.Printf("⚠️ NODE-FAIL: %s | Error: %v", url, err)
				continue
			}

			sourceName := feed.Title
			lowerURL := strings.ToLower(url)
			if strings.Contains(lowerURL, "techcrunch") {
				sourceName = "TechCrunch AI"
			} else if strings.Contains(lowerURL, "venturebeat") {
				sourceName = "VentureBeat AI"
			} else if strings.Contains(lowerURL, "theverge") {
				sourceName = "The Verge AI"
			} else if strings.Contains(lowerURL, "zdnet") {
				sourceName = "ZDNet AI"
			} else if strings.Contains(lowerURL, "aljazeera") {
				sourceName = "Al Jazeera"
			} else if strings.Contains(lowerURL, "theguardian") {
				sourceName = "The Guardian"
			}
			
			log.Printf("✅ NODE-READY: Ingested %d items from %s", len(feed.Items), sourceName)

			limit := 10
			if len(feed.Items) < limit {
				limit = len(feed.Items)
			}

			for i := 0; i < limit; i++ {
				item := feed.Items[i]
				publishedAt := time.Now()
				if item.Published != "" {
					success := false
					for _, layout := range dateLayouts {
						if t, err := time.Parse(layout, item.Published); err == nil {
							publishedAt = t
							success = true
							break
						}
					}
					if !success {
						log.Printf("⚠️ Date Parse Failed for Node %s: %s", sourceName, item.Published)
					}
				}

				itemsWithTime = append(itemsWithTime, NewsWithTime{
					Item: NewsItem{
						ID:        item.GUID,
						Title:     item.Title,
						Summary:   stripHTML(item.Description),
						Source:    sourceName,
						Timestamp: item.Published,
						URL:       item.Link,
					},
					Date: publishedAt,
				})
			}
		}

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

			cacheLock.Lock()
			if rdb != nil {
				rdb.Set(ctx, feedKey, data, retention)
				rdb.Set(ctx, tickerKey, tData, retention)
			}
			memoryCache = data
			tickerCache = tData
			cacheLock.Unlock()

			log.Printf("✅ Pipeline synchronized: %d feed items, %d ticker items", len(allItems), len(tickerStrings))
		}

		intervalStr := os.Getenv("INTELLIGENCE_INTERVAL")
		interval, err := time.ParseDuration(intervalStr)
		if err != nil {
			interval = 2 * time.Hour
		}
		time.Sleep(interval)
	}
}

func stripHTML(s string) string {
	// 🧬 STAFF-LEVEL NEURAL SCRUBBER
	// 1. Unescape HTML Entities (e.g. &#39; -> ')
	s = html.UnescapeString(s)
	
	// 2. Tactical Tag Removal via Regex
	re := regexp.MustCompile("<[^>]*>")
	s = re.ReplaceAllString(s, " ")
	
	// 3. Neural Whitespace Consolidation
	s = strings.Join(strings.Fields(s), " ")
	
	return strings.TrimSpace(s)
}

func runTacticalBriefing() {
	ticker := time.NewTicker(1 * time.Minute)
	log.Println("🕒 Intelligence Scheduler Node: Operational [06:00 / 18:00 Target]")
	
	for range ticker.C {
		now := time.Now()
		if (now.Hour() == 6 && now.Minute() == 0) || (now.Hour() == 18 && now.Minute() == 0) {
			log.Printf("📡 CRITICAL: Executing Global Intelligence Briefing [Time: %s]", now.Format("15:04"))
			if rdb != nil {
				subscribers, err := rdb.SMembers(ctx, "wp:subscribers").Result()
				if err == nil && len(subscribers) > 0 {
					for _, email := range subscribers {
						sendWelcomeEmail(email)
					}
				}
			}
		}
	}
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using defaults")
	}

	initRedis()
	go gatherIntelligence()
	go runTacticalBriefing()

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}
		c.Next()
	})

	r.GET("/api/feed", func(c *gin.Context) {
		cacheLock.RLock()
		defer cacheLock.RUnlock()

		var data []byte
		if rdb != nil {
			data, _ = rdb.Get(ctx, feedKey).Bytes()
		} else {
			data = memoryCache
		}

		if len(data) == 0 {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Intelligence pipeline initializing"})
			return
		}
		c.Data(http.StatusOK, "application/json", data)
	})

	r.GET("/api/ticker", func(c *gin.Context) {
		cacheLock.RLock()
		defer cacheLock.RUnlock()

		var data []byte
		if rdb != nil {
			data, _ = rdb.Get(ctx, tickerKey).Bytes()
		} else {
			data = tickerCache
		}

		if len(data) == 0 {
			c.JSON(http.StatusOK, []string{"🌍 Synchronizing Strategic Intelligence Grid..."})
			return
		}
		c.Data(http.StatusOK, "application/json", data)
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
		sendWelcomeEmail(body.Email)
		c.JSON(http.StatusOK, gin.H{"message": "Subscribed! Next report at 06:00/18:00 IST."})
	})

	r.POST("/api/heartbeat", func(c *gin.Context) {
		clientIP := c.ClientIP()
		if rdb != nil {
			rdb.SAdd(ctx, "wp:active_users", clientIP)
			rdb.Expire(ctx, "wp:active_users", 60*time.Second) 
		}
		c.JSON(http.StatusOK, gin.H{"status": "recorded"})
	})

	r.GET("/api/operatives", func(c *gin.Context) {
		count := int64(1)
		if rdb != nil {
			val, _ := rdb.SCard(ctx, "wp:active_users").Result()
			if val > 0 { count = val }
		}
		c.JSON(http.StatusOK, gin.H{"count": count})
	})

	port := os.Getenv("PORT")
	if port == "" { port = "8081" }
	log.Printf("WorldPulse Intelligence Server live on port %s", port)
	r.Run(":" + port)
}
