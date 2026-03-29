package worker

import (
	"time"

	"worldpulse-server/internal/db"
	"github.com/rs/zerolog/log"
)

type BriefingWorker struct {
	store *db.Store
}

func NewBriefingWorker(store *db.Store) *BriefingWorker {
	return &BriefingWorker{store: store}
}

func (w *BriefingWorker) Start() {
	ticker := time.NewTicker(1 * time.Minute)
	log.Info().Msg("🕒 Intelligence Scheduler Node: Operational [06:00 / 18:00 Target]")
	
	for range ticker.C {
		now := time.Now()
		if (now.Hour() == 6 && now.Minute() == 0) || (now.Hour() == 18 && now.Minute() == 0) {
			log.Info().Str("time", now.Format("15:04")).Msg("📡 CRITICAL: Executing Global Intelligence Briefing")
			subscribers, err := w.store.GetSubscribers()
			if err == nil && len(subscribers) > 0 {
				for _, email := range subscribers {
					w.sendEmail(email)
				}
			}
		}
	}
}

func (w *BriefingWorker) sendEmail(email string) {
	log.Info().Str("email", email).Msg("📧 [INTEL-MAIL] Sending tactical briefing")
}
