# 🌎 WorldPulse: Tactical AI Intelligence Grid

WorldPulse is a high-performance, real-time intelligence platform designed for strategic analysts and AI researchers. It delivers high-signal, mission-critical news through a refined tactical interface with concurrent multi-source synchronization.

![WorldPulse Preview](https://via.placeholder.com/1200x630/000000/14FFB4?text=WORLDPULSE+INTELLIGENCE+GRID)

---

## ⚡ Core Features

- **📡 Concurrent Intelligence Pipeline**: A robust Go-based backend that synchronizes with 13+ global AI research sources simultaneously using high-performance goroutines.
- **🛡️ Signal Filtering**: Proprietary keyword-based filtering that isolates high-signal AI news while discarding noise from general tech feeds.
- **🎨 Atmospheric Theme Engine**: A dynamic theme system with multiple tactical profiles (Emerald, Ruby, Amber, Obsidian) and a premium "Atmospheric Grey" light mode default.
- **🕒 Tactical Briefings**: Scheduled intelligence summaries delivered at mission-critical windows (06:00 and 18:00 IST).
- **🚀 Real-Time Operative Tracking**: Passive user monitoring to track active strategic analysts currently on the grid.
- **♾️ Infinite Intelligence**: Seamless scroll-based feed discovery across research, study, and industry study categories.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS (Glassmorphic Design)
- **Components**: Radix UI / Shadcn
- **Icons**: Lucide React
- **Animations**: Framer Motion & CSS Marquees

### **Backend**
- **Language**: Go (v1.25+)
- **Framework**: Gin Gonic
- **Database/Cache**: Redis (with local in-memory fallback for resilience)
- **Parsing**: `gofeed` (Concurrent XML/RSS processing)
- **Auth/API**: RESTful architecture with industry-standard `cmd/` structure.

---

## 📂 Project Structure

```text
.
├── client/              # Next.js Frontend
│   ├── app/             # Application routes & layout
│   ├── components/      # UI & Functional components
│   └── lib/             # Utilities & Types
├── server/              # Go Backend
│   ├── cmd/             # Main binaries (Entry points)
│   ├── internal/        # Private modular logic
│   │   ├── api/         # API Routing & Handlers
│   │   ├── worker/      # Background sync jobs
│   │   ├── db/          # Data persistence layer
│   │   └── ...          
│   └── go.mod           # Go dependencies
└── DEPLOYMENT.md        # Deployment instructions
```

---

## 🚀 Quick Start

### **1. 📡 Backend Setup**
Navigate to the `server` directory:
```bash
cd server
go mod tidy
go run cmd/server/main.go
```
*Requires Redis locally or a `REDIS_URL` in `.env`.*

### **2. 🌐 Frontend Setup**
Navigate to the `client` directory:
```bash
cd client
npm install
npm run dev
```

---

## 🔧 Configuration (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `8081` |
| `REDIS_URL` | Connection string for Redis | `localhost:6379` |
| `INTELLIGENCE_INTERVAL` | Data refresh frequency | `2h` |
| `NEXT_PUBLIC_API_URL` | API endpoint for the frontend | `http://localhost:8081` |

---

## 🛡️ License
Proprietary Intelligence Grid - All Rights Reserved. Produced by **WorldPulse Strategic Operations**.
