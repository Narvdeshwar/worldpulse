package main

import (
	"log"
	"os"

	"worldpulse-server/internal/api"
	"worldpulse-server/internal/config"
	"worldpulse-server/internal/db"
	"worldpulse-server/internal/worker"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using defaults")
	}

	cfg := config.Load()
	store := db.NewStore(cfg.RedisURL)

	// Background Gatherer
	gatherer := worker.NewGatherer(store, cfg.IntelligenceInterval, cfg.Retention)
	go gatherer.Start()

	// Tactical Briefing Worker
	briefingWorker := worker.NewBriefingWorker(store)
	go briefingWorker.Start()

	// API Server
	server := api.NewServer(store)
	r := server.SetupRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	log.Printf("WorldPulse Intelligence Server live on port %s", port)
	
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
