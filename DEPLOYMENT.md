# 🚀 WorldPulse Deployment Guide

This document outlines the steps to take WorldPulse from your local machine to a public, production-ready environment.

## 🌩️ Recommended Infrastructure

| Component | Provider | Why? | Cost |
| :--- | :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com) | Native Next.js support, edge caching. | Free Tier |
| **Backend** | [Render](https://render.com) | Easy Go deployment, managed environment. | Free Tier |
| **Database** | [Upstash](https://upstash.com) | Serverless Redis with global replication. | Free Tier |

---

## 🛠️ Step-by-Step Deployment

### 1. Setup Redis (Upstash)
1. Go to [Upstash Console](https://console.upstash.com/).
2. Create a new Redis database (any region).
3. Copy the **REST URL** or **Connection String**.
4. You will use this as `REDIS_URL` in your production environment variables.

### 2. Deploy the Backend (Render)
1. Push your code to a GitHub repository.
2. Log in to [Render](https://dashboard.render.com).
3. Create a **New Web Service**.
4. Connect your repo and select the `server` directory.
5. **Build Command**: `go build -o main main.go`
6. **Start Command**: `./main`
7. **Environment Variables**:
   - `PORT`: `8080`
   - `REDIS_URL`: (Paste your Upstash URL)
   - `INTELLIGENCE_INTERVAL`: `2h`

### 3. Deploy the Frontend (Vercel)
1. Log in to [Vercel](https://vercel.com).
2. Create a **New Project** and select your GitHub repo.
3. Select the `client` directory as the root.
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: (Paste your Render Web Service URL, e.g., `https://worldpulse-api.onrender.com`)
5. Click **Deploy**.

---

## 🔍 Post-Deployment Verification
- Ensure the **Global Ticker** is scrolling (it means the frontend is talking to the backend).
- Check the **News Cards** display real headlines (it means the RSS aggregator is successful).
- Verify **Mobile Responsiveness** on your phone.

---

## 🔒 Security Best Practices
- **Never** commit your `.env` file to Git.
- Use **Environment Variables** in the dashboard of your provider (Vercel/Render).
- Consider adding an `X-API-KEY` header if you want to restrict your backend to only accept requests from your frontend.
