### Matching Service — Quick Start

A minimal guide to run `matching-service` locally with Go or via Docker.

---

### Prerequisites

- **Go** 1.21+ (tested with 1.24 in Dockerfile)
- **Docker** (optional, for containerized run)
- Optional: a running Redis if you plan to exercise match flows

---

### Clone and navigate

```bash
cd /Users/kaichen/Desktop/cs3219-ay2526s1-project-g11/backend/matching-service
```

---

### Option A) Run locally with Go

1) Set environment (optional):
```bash
export PORT=8080
export REDIS_URL=localhost:6379
```

2) Download modules:
```bash
go mod download
```

3) Start the server:
```bash
go run ./cmd/web
```

4) Verify the service:
```bash
curl http://localhost:8080/health
```

---

### Option B) Run with Docker

1) Build the image:
```bash
docker build -t matching-service .
```

2) Run the container:
```bash
docker run --rm -p 8080:8080 \
  -e PORT=8080 \
  -e REDIS_URL=host.docker.internal:6379 \
  matching-service
```

3) Verify:
```bash
curl http://localhost:8080/health
```

---

### Endpoints

- `GET /` — Root message
- `GET /health` — Health check

---

### Notes

- Entrypoint: `cmd/web/server.go` (Gin HTTP server)
- Default port is `8080` (configurable via `PORT`).
- The app reads `.env` if present (using `godotenv`); environment variables take precedence.

