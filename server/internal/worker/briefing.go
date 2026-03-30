package worker

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"worldpulse-server/internal/db"
	"worldpulse-server/internal/email"
	"worldpulse-server/internal/models"
	"github.com/rs/zerolog/log"
)

type BriefingWorker struct {
	store *db.Store
	mail  *email.Service
}

func NewBriefingWorker(store *db.Store) *BriefingWorker {
	return &BriefingWorker{
		store: store,
		mail:  email.NewService(),
	}
}

func (w *BriefingWorker) Start() {
	ticker := time.NewTicker(1 * time.Minute)

	// Explicitly target IST (UTC+5:30)
	loc := time.FixedZone("IST", int(5.5*3600))

	log.Info().Msg("🕒 Intelligence Scheduler Node: Operational [06:00 / 18:00 IST Target]")

	for range ticker.C {
		now := time.Now().In(loc)
		if (now.Hour() == 6 && now.Minute() == 0) || (now.Hour() == 18 && now.Minute() == 0) {
			log.Info().Str("time_ist", now.Format("15:04")).Msg("📡 CRITICAL: Executing Global Intelligence Briefing (IST)")

			subscribers, err := w.store.GetSubscribers()
			if err != nil || len(subscribers) == 0 {
				log.Warn().Msg("⚠️ [INTEL-MAIL] No subscribers found in tactical grid")
				continue
			}

			// Fetch latest news
			newsData := w.store.GetFeedData("wp:feed:latest")
			var items []models.NewsItem
			if len(newsData) > 0 {
				json.Unmarshal(newsData, &items)
			}

			if len(items) == 0 {
				log.Warn().Msg("⚠️ [INTEL-MAIL] Intelligence feed is empty, skipping dispatch")
				continue
			}

			if len(items) > 10 {
				items = items[:10]
			}

			body := w.formatBriefing(items)

			for _, emailAddr := range subscribers {
				w.sendBriefing(emailAddr, body)
			}
		}
	}
}

func (w *BriefingWorker) formatBriefing(items []models.NewsItem) string {
	var sb strings.Builder
	sb.WriteString("<html><body style='background-color: #0c0c0c; color: #e0e0e0; font-family: monospace; padding: 20px;'>")
	sb.WriteString("<h1 style='color: #00ff88;'>Tactical Intelligence Briefing</h1>")
	sb.WriteString("<p style='color: #888;'>Status: Synchronized | Grid Time: " + time.Now().Format(time.RFC1123) + "</p>")
	sb.WriteString("<hr style='border: 1px solid #333;'>")

	for _, item := range items {
		sb.WriteString("<div style='margin-bottom: 25px; border-left: 2px solid #00ff88; padding-left: 15px;'>")
		sb.WriteString(fmt.Sprintf("<h3 style='margin: 0; color: #fff;'>[%s] %s</h3>", item.Source, item.Title))
		sb.WriteString(fmt.Sprintf("<p style='font-size: 14px; line-height: 1.5;'>%s</p>", item.Summary))
		sb.WriteString(fmt.Sprintf("<a href='%s' style='color: #00ff88; text-decoration: none; font-weight: bold;'>[ACCESS INTELLIGENCE SOURCE]</a>", item.URL))
		sb.WriteString("</div>")
	}

	sb.WriteString("<hr style='border: 1px solid #333;'>")
	sb.WriteString("<p style='font-size: 10px; color: #555;'>This message is an automated intelligence dispatch from WorldPulse Node. If you wish to terminate this connection, please respond 'UNSUBSCRIBE'.</p>")
	sb.WriteString("</body></html>")
	return sb.String()
}

func (w *BriefingWorker) sendBriefing(to string, body string) {
	log.Info().Str("email", to).Msg("📧 [INTEL-MAIL] Dispatching briefing packet...")
	err := w.mail.Send(to, "Tactic: WorldPulse Intelligence Briefing", body)
	if err != nil {
		log.Error().Err(err).Str("to", to).Msg("❌ [INTEL-MAIL] Transmission FAILURE")
	} else {
		log.Info().Str("to", to).Msg("✅ [INTEL-MAIL] Transmission confirmed")
	}
}
