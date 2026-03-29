package worker

import (
	"log"
	"time"

	"worldpulse-server/internal/db"
)

type BriefingWorker struct {
	store *db.Store
}

func NewBriefingWorker(store *db.Store) *BriefingWorker {
	return &BriefingWorker{store: store}
}

func (w *BriefingWorker) Start() {
	ticker := time.NewTicker(1 * time.Minute)
	log.Println("🕒 Intelligence Scheduler Node: Operational [06:00 / 18:00 Target]")
	
	for range ticker.C {
		now := time.Now()
		if (now.Hour() == 6 && now.Minute() == 0) || (now.Hour() == 18 && now.Minute() == 0) {
			log.Printf("📡 CRITICAL: Executing Global Intelligence Briefing [Time: %s]", now.Format("15:04"))
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
	log.Printf("📧 [INTEL-MAIL] Sending tactical briefing to: %s [06:00/18:00 window]", email)
}
