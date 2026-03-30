package api

import (
	"net/http"

	"worldpulse-server/internal/db"

	"github.com/gin-gonic/gin"
)

type Server struct {
	store *db.Store
	mail  *email.Service
}

func NewServer(store *db.Store, mail *email.Service) *Server {
	return &Server{store: store, mail: mail}
}

func (s *Server) SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(s.corsMiddleware())

	r.GET("/api/feed", s.handleFeed)
	r.GET("/api/ticker", s.handleTicker)
	r.POST("/api/subscribe", s.handleSubscribe)
	r.POST("/api/heartbeat", s.handleHeartbeat)
	r.GET("/api/operatives", s.handleOperatives)

	return r
}

func (s *Server) corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, PATCH")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}
		c.Next()
	}
}

func (s *Server) handleFeed(c *gin.Context) {
	data := s.store.GetFeedData("wp:feed:latest")
	if len(data) == 0 {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Intelligence pipeline initializing"})
		return
	}
	c.Data(http.StatusOK, "application/json", data)
}

func (s *Server) handleTicker(c *gin.Context) {
	data := s.store.GetTickerData("wp:ticker:latest")
	if len(data) == 0 {
		c.JSON(http.StatusOK, []string{"🌍 Synchronizing Strategic Intelligence Grid..."})
		return
	}
	c.Data(http.StatusOK, "application/json", data)
}

func (s *Server) handleSubscribe(c *gin.Context) {
	var body struct {
		Email string `json:"email"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		return
	}
	
	s.store.AddSubscriber(body.Email)
	
	// Send welcome email
	go func() {
		subject := "Signal established: Welcome to WorldPulse Intelligence Grid"
		body := "<html><body style='background-color: #0c0c0c; color: #e0e0e0; font-family: monospace; padding: 20px;'>" +
			"<h1 style='color: #00ff88;'>Signal Established.</h1>" +
			"<p>You are now connected to the WorldPulse strategic intelligence grid.</p>" +
			"<p>Your first tactical briefing will arrive at the next 06:00/18:00 IST window.</p>" +
			"<hr style='border: 1px solid #333;'>" +
			"<p style='font-size: 10px; color: #555;'>End of Transmission.</p></body></html>"
		s.mail.Send(body.Email, subject, body)
	}()
	
	c.JSON(http.StatusOK, gin.H{"message": "Subscribed! Next report at 06:00/18:00 IST."})
}

func (s *Server) handleHeartbeat(c *gin.Context) {
	s.store.TrackUser(c.ClientIP())
	c.JSON(http.StatusOK, gin.H{"status": "recorded"})
}

func (s *Server) handleOperatives(c *gin.Context) {
	count := s.store.GetActiveUsersCount()
	c.JSON(http.StatusOK, gin.H{"count": count})
}
