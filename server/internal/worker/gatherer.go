package worker

import (
	"encoding/json"
	"fmt"
	"log"
	"sort"
	"strings"
	"sync"
	"time"

	"worldpulse-server/internal/db"
	"worldpulse-server/internal/models"
	"worldpulse-server/internal/utils"

	"github.com/mmcdole/gofeed"
)

var dateLayouts = []string{
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

var aiKeywords = []string{
	"ai ", "artificial intelligence", "llm ", "machine learning", 
	"openai", "deepmind", "gpt", "neural network", "generative",
	"claude", "gemini", "transformer", "robotics", "automation",
	"predictive analytics", "superintelligence", "agi ", "nlp ",
}

var feeds = []string{
	"https://techcrunch.com/category/artificial-intelligence/feed/",
	"https://venturebeat.com/category/ai/feed/",
	"https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
	"https://www.zdnet.com/topic/artificial-intelligence/rss.xml",
	"https://www.wired.com/tag/ai/feed/",
	"https://scitechdaily.com/tag/artificial-intelligence/feed/",
	"https://www.artificialintelligence-news.com/feed/",
	"https://openai.com/news/rss.xml",
	"https://deepmind.google/blog/rss.xml",
	"https://unite.ai/feed/",
	"https://ai.meta.com/blog/rss/",
	"https://bair.berkeley.edu/blog/feed.xml",
	"https://rss.arxiv.org/rss/cs.AI",
}

type Gatherer struct {
	store      *db.Store
	parser     *gofeed.Parser
	feedKey    string
	tickerKey  string
	retention  time.Duration
	interval   time.Duration
}

func NewGatherer(store *db.Store, interval, retention time.Duration) *Gatherer {
	fp := gofeed.NewParser()
	fp.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 WorldPulse/1.1"

	return &Gatherer{
		store:      store,
		parser:     fp,
		feedKey:    "wp:feed:latest",
		tickerKey:  "wp:ticker:latest",
		retention:  retention,
		interval:   interval,
	}
}

func (g *Gatherer) Start() {
	for {
		log.Println("🌍 SYNCHRONIZING: Refreshing AI Research Strategic Grid...")
		g.Sync()
		time.Sleep(g.interval)
	}
}

func (g *Gatherer) Sync() {
	var resultsChan = make(chan []models.NewsWithTime, len(feeds))
	var wg sync.WaitGroup

	for _, url := range feeds {
		wg.Add(1)
		go func(url string) {
			defer wg.Done()
			resultsChan <- g.fetchFeed(url)
		}(url)
	}

	wg.Wait()
	close(resultsChan)

	var allItemsWithTime []models.NewsWithTime
	for results := range resultsChan {
		allItemsWithTime = append(allItemsWithTime, results...)
	}

	sort.Slice(allItemsWithTime, func(i, j int) bool {
		return allItemsWithTime[i].Date.After(allItemsWithTime[j].Date)
	})

	var allItems []models.NewsItem
	var tickerStrings []string
	for _, it := range allItemsWithTime {
		allItems = append(allItems, it.Item)
		if len(tickerStrings) < 15 {
			tickerStrings = append(tickerStrings, fmt.Sprintf("[%s] %s", it.Item.Source, it.Item.Title))
		}
	}

	if len(allItems) > 0 {
		data, _ := json.Marshal(allItems)
		tData, _ := json.Marshal(tickerStrings)
		g.store.SetFeedData(g.feedKey, data, g.retention)
		g.store.SetTickerData(g.tickerKey, tData, g.retention)
		log.Printf("✅ Pipeline synchronized: %d feed items, %d ticker items", len(allItems), len(tickerStrings))
	}
}

func (g *Gatherer) fetchFeed(url string) []models.NewsWithTime {
	feed, err := g.parser.ParseURL(url)
	if err != nil {
		log.Printf("⚠️ NODE-FAIL: %s | Error: %v", url, err)
		return nil
	}

	sourceName := g.getSourceName(url, feed.Title)
	var items []models.NewsWithTime

	for _, item := range feed.Items {
		if !g.hasAIKeywords(item.Title, item.Description) && !g.isBypassedSource(url) {
			continue
		}

		publishedAt := g.parseDate(item.Published)
		if time.Since(publishedAt) > 24*time.Hour {
			continue
		}

		items = append(items, models.NewsWithTime{
			Item: models.NewsItem{
				ID:        item.GUID,
				Title:     item.Title,
				Summary:   utils.StripHTML(item.Description),
				Source:    sourceName,
				Timestamp: item.Published,
				URL:       item.Link,
			},
			Date: publishedAt,
		})
	}
	return items
}

func (g *Gatherer) getSourceName(url, defaultTitle string) string {
	lowerURL := strings.ToLower(url)
	switch {
	case strings.Contains(lowerURL, "techcrunch"): return "TechCrunch AI"
	case strings.Contains(lowerURL, "venturebeat"): return "VentureBeat AI"
	case strings.Contains(lowerURL, "theverge"): return "The Verge AI"
	case strings.Contains(lowerURL, "zdnet"): return "ZDNet AI"
	case strings.Contains(lowerURL, "wired"): return "Wired Tech"
	case strings.Contains(lowerURL, "openai"): return "OpenAI Blog"
	case strings.Contains(lowerURL, "deepmind"): return "Google DeepMind"
	case strings.Contains(lowerURL, "meta.com/blog"): return "Meta AI Research"
	case strings.Contains(lowerURL, "bair.berkeley.edu"): return "Berkeley AI Research"
	case strings.Contains(lowerURL, "arxiv"): return "arXiv AI Research"
	case strings.Contains(lowerURL, "unite.ai"): return "Unite AI"
	case strings.Contains(lowerURL, "scitechdaily"): return "SciTech Daily AI"
	default: return defaultTitle
	}
}

func (g *Gatherer) hasAIKeywords(title, description string) bool {
	titleLower := strings.ToLower(title)
	descriptionLower := strings.ToLower(description)
	for _, kw := range aiKeywords {
		if strings.Contains(titleLower, kw) || strings.Contains(descriptionLower, kw) {
			return true
		}
	}
	return false
}

func (g *Gatherer) isBypassedSource(url string) bool {
	lowerURL := strings.ToLower(url)
	return strings.Contains(lowerURL, "openai") || 
		strings.Contains(lowerURL, "deepmind") || 
		strings.Contains(lowerURL, "artificialintelligence-news")
}

func (g *Gatherer) parseDate(published string) time.Time {
	if published == "" {
		return time.Now()
	}
	for _, layout := range dateLayouts {
		if t, err := time.Parse(layout, published); err == nil {
			return t
		}
	}
	return time.Now()
}
