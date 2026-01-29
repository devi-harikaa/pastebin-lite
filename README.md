# Pastebin Lite

A minimal Pastebin-like application built with **Next.js (App Router)** and **Upstash Redis**.  
It allows users to create temporary text pastes that can expire by **time (TTL)** or **number of views**.

---

## Features

- Create text pastes via UI or API
- Retrieve pastes via API or HTML page
- Optional expiration by:
  - Time (`ttl_seconds`)
  - View limit (`max_views`)
- Deterministic testing support for expiry logic
- Persistent storage using Upstash Redis
- Safe rendering (no HTML/script execution)

---

### Live Demo

The application is deployed on Vercel:

https://pastebin-lite-eight-blue.vercel.app/

---

## Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Upstash Redis** (serverless persistence)

---

## Project Structure
```
pastebin-lite/
├── app/
│   ├── api/
│   │   ├── healthz/
│   │   │   └── route.ts        # Health check endpoint
│   │   └── pastes/
│   │       ├── route.ts        # Create paste
│   │       └── [id]/
│   │           └── route.ts    # Fetch paste logic
│   ├── p/
│   │   └── [id]/
│   │       └── page.tsx        # HTML view for paste
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home / create UI
│   └── globals.css             # Global styles
│
├── lib/
│   └── redis.ts                # Upstash Redis client
│
├── .env.local                  # Environment variables (not committed)
├── package.json
├── tsconfig.json
```
---

## Local Setup

### 1. Install dependencies

```bash
npm install
```
### 2. Configure environment variables
Create a file named .env.local in the project root:
```.env
UPSTASH_REDIS_REST_URL=your_upstash_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token
```
These values can be obtained from the Upstash dashboard.

3. Run the development server
```bash
npm run dev
```

OPEN :

http://localhost:3000

API Endpoints
Health Check
```check
GET /api/healthz
```
Response:

{ "ok": true }
Create Paste
POST /api/pastes
Body:

{
  "content": "Hello world",
  "ttl_seconds": 60,
  "max_views": 2
}
Response:

{
  "id": "abc123",
  "url": "https://<host>/p/abc123"
}

Fetch Paste (API)
```check
GET /api/pastes/:id
```
Response:

{
  "content": "Hello world",
  "remaining_views": 1,
  "expires_at": null
}
If expired or unavailable:

{ "error": "Not Found" }
View Paste (HTML)
Open in browser:
```
/p/:id
```
The paste content is rendered safely as plain text.

Deterministic Testing (TEST_MODE)
The application supports deterministic testing for expiry logic.

When the environment variable TEST_MODE=1 is set,

And the request includes the header:

x-test-now-ms: <timestamp_in_ms>
The application will use the provided timestamp instead of the system clock.

This is intended for automated testing and grading.

---

Deployment
---
The project is compatible with Vercel.

Required environment variables on Vercel:
```
UPSTASH_REDIS_REST_URL

UPSTASH_REDIS_REST_TOKEN
```
No other configuration is required.

---


Secrets are not committed to the repository.

No hardcoded hostnames are used.

Storage is persistent and serverless-friendly.

---
License
---
This project is for educational and evaluation purposes.


---
