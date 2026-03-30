package main

import (
	"os"
	"time"

	"worldpulse-server/internal/api"
	"worldpulse-server/internal/config"
	"worldpulse-server/internal/db"
	"worldpulse-server/internal/email"
	"worldpulse-server/internal/worker"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	// Initialize Structured Logging Node
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339})
	zerolog.TimeFieldFormat = time.RFC3339

	if err := godotenv.Load(); err != nil {
		log.Warn().Msg("No .env file found, using defaults")
	}

	cfg := config.Load()
	store := db.NewStore(cfg.RedisURL)
	mailService := email.NewService()

	// Background Gatherer
	gatherer := worker.NewGatherer(store, cfg.IntelligenceInterval, cfg.Retention)
	go gatherer.Start()

	// Tactical Briefing Worker
	briefingWorker := worker.NewBriefingWorker(store)
	go briefingWorker.Start()

	// API Server
	server := api.NewServer(store, mailService)
	r := server.SetupRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	log.Info().Str("port", port).Msg("WorldPulse Intelligence Server live")
	
	if err := r.Run(":" + port); err != nil {
		log.Fatal().Err(err).Msg("Server failure in grid node")
	}
}
