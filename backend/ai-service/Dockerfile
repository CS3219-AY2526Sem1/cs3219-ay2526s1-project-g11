FROM python:3.10-slim

# Environment
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    UV_SYSTEM_PYTHON=1 \
    PATH="/app/.venv/bin:$PATH"

# System deps (curl optional for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Workdir
WORKDIR /app

# Install uv
RUN pip install --no-cache-dir uv

# Copy dependency manifests first (leverage Docker layer cache)
COPY pyproject.toml uv.lock ./

# Install deps (creates .venv)
RUN uv sync --frozen

# Copy app code
COPY . .

# Expose port
EXPOSE 8000

# Optional healthcheck (FastAPI /health endpoint)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:8000/health || exit 1

# Run server (respect Cloud Run PORT; default to 8000 locally)
CMD uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}