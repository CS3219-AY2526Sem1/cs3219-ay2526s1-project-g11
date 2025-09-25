### AI Service — Quick Start

A minimal guide to run `ai-service` locally using either uv or Docker.

---

### Prerequisites

- **uv**: install from `https://docs.astral.sh/uv/` (or `pip install uv`)
- **Python**: 3.10+
- **Docker**: optional, for containerized run
- Optional env for Gemini/Google GenAI: set `GOOGLE_API_KEY` in a `.env` file

---

### Clone and navigate

```bash
cd backend/ai-service
```

---

### Option A) Run locally with uv

1) Install dependencies (creates `.venv` from `pyproject.toml`/`uv.lock`):
```bash
uv sync
```

2) Create a `.env` (optional, if using Google GenAI):
```bash
printf "GOOGLE_API_KEY=your_api_key_here\n" > .env
```

3) Start the server (FastAPI via Uvicorn):
```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

4) Open the API:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`

---

### Option B) Run with Docker

1) Build the image:
```bash
docker build -t ai-service .
```

2) Run the container:
```bash
docker run --rm -p 8000:8000 \
  -e PORT=8000 \
  -e GOOGLE_API_KEY=your_api_key_here \
  ai-service
```

3) Verify:
```bash
curl http://localhost:8000/health
```

Docs available at `http://localhost:8000/docs`.

---

### Notes

- App entrypoint: `app/main.py` with `FastAPI(title="AI Service", version="1.0.0")`.
- Default port is `8000`. When running via Docker, the image honors `PORT`.
- OpenAPI JSON is at `/openapi.json`.

