package email

import (
	"fmt"
	"net/smtp"
	"os"
)

type Service struct {
	host     string
	port     string
	from     string
	password string
}

func NewService() *Service {
	return &Service{
		host:     os.Getenv("SMTP_HOST"),
		port:     os.Getenv("SMTP_PORT"),
		from:     os.Getenv("SMTP_FROM"),
		password: os.Getenv("SMTP_PASS"),
	}
}

func (s *Service) Send(to string, subject, body string) error {
	if s.host == "" || s.password == "" {
		return fmt.Errorf("SMTP configuration missing")
	}

	auth := smtp.PlainAuth("", s.from, s.password, s.host)
	addr := fmt.Sprintf("%s:%s", s.host, s.port)

	msg := []byte("To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n" +
		body)

	return smtp.SendMail(addr, auth, s.from, []string{to}, msg)
}
