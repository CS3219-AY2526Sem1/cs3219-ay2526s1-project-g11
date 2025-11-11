# Service Containerization & Deployment Documentation

## Overview

This document describes the containerization and deployment strategy for the PeerPrep microservices architecture, covering 5 backend services and 1 frontend application.

---

## 1. Implementation Tech Stack & Dockerfile Strategy

### Service Technology Choices

| Service | Language/Runtime | Framework | Package Manager | Base Image Strategy |
|---------|-----------------|-----------|-----------------|---------------------|
| **User Service** | Node.js 20 | Express.js | npm | Single-stage Alpine |
| **Matching Service** | Go 1.24.5 | Gin | go modules | Multi-stage (Alpine → Distroless) |
| **Question Service** | Node.js 20 | Express.js 5.x | npm | Single-stage Alpine |
| **Collab Service** | Elixir 1.18.4 | Phoenix Framework | mix | Multi-stage (Debian → Debian) |
| **AI Service** | Python 3.10 | FastAPI | uv | Single-stage Slim |
| **Frontend** | TypeScript | React + Vite | pnpm | - (Vercel hosted) |

### Dockerfile Optimization Strategies

#### **Node.js Services** (User, Question)
```dockerfile
FROM node:20-alpine
# Key optimizations:
- Alpine Linux base (~5MB vs ~900MB for standard Node)
- npm ci --omit=dev (production dependencies only)
- Layer caching: COPY package*.json before source code
- Non-root user (app:app) for security
- PORT as environment variable for flexibility
```

**Justification**: Alpine provides minimal attack surface while Node 20 LTS ensures long-term support. Single-stage is sufficient since npm ci already handles dev/prod separation.

#### **Go Service** (Matching)
```dockerfile
# Stage 1: Builder
FROM golang:1.24.5-alpine AS builder
- Static binary compilation (CGO_ENABLED=0)
- Build flags: -trimpath -ldflags "-s -w" (strip debug, reduce size)
- Cross-platform support (TARGETOS/TARGETARCH)

# Stage 2: Runtime
FROM gcr.io/distroless/static-debian12
- Distroless = no shell, no package manager (minimal CVEs)
- Binary copied from builder stage
- Non-root user (nonroot)
```

**Justification**: Multi-stage build reduces final image from ~400MB to ~15MB. Distroless eliminates shell access, preventing RCE attacks. Static linking ensures no runtime dependencies.

#### **Python Service** (AI)
```dockerfile
FROM python:3.10-slim
# Key optimizations:
- Slim variant instead of full image (~100MB vs ~900MB)
- uv package manager (10-100x faster than pip)
- Virtual environment in .venv for isolation
- PIP_NO_CACHE_DIR=1 to reduce image size
- Health check built into Dockerfile
```

**Justification**: uv provides faster dependency resolution and deterministic builds. Slim base balances size with compatibility (needed for compiled Python packages).

#### **Elixir Service** (Collab)
```dockerfile
# Stage 1: Build
FROM hexpm/elixir:1.18.4-erlang-28.1-debian-bookworm
- Mix release for production optimization
- Separate layer for dependencies (better caching)

# Stage 2: Runtime
FROM debian:bookworm
- Runtime dependencies only (libstdc++6, openssl, libncurses5)
- Mix release artifacts copied from builder
```

**Justification**: Mix releases provide ahead-of-time compilation and optimized runtime. Multi-stage reduces image size by excluding build tools.

### Dependency Management & Security

**Dependency Scanning**: Currently implemented at CI level:
- **Go**: `golangci-lint` for code quality (continue-on-error)
- **Python**: `ruff` for linting
- **Node.js**: No explicit vulnerability scanning (recommended: `npm audit`)
- **Elixir**: Standard mix dependency checks

**Missing**: Docker image vulnerability scanning (Trivy/Snyk not yet integrated)

**Image Tagging/Versioning**:
- Production: Git SHA tags (`gcr.io/PROJECT_ID/user-service:abc123def`)
- Latest tag not used (prevents accidental deployments)
- Traceability: Each deployment maps to a specific commit

---

## 2. Configuration & Secrets Management

### Environment Variable Strategy

All services use 12-factor app methodology with environment-based configuration:

#### **User Service** (`.env.sample`)
```bash
DB_CLOUD_URI=mongodb://...           # MongoDB connection string
DB_LOCAL_URI=mongodb://localhost...  # Local development DB
PORT=3001                            # Service port
ENV=PROD                             # Environment flag
JWT_SECRET=secret                    # Authentication secret
```

#### **Matching Service**
```bash
APP_ENV=production                   # Environment mode
PORT=8080                            # Service port
REDIS_URL=redis:6379                 # Redis connection
USER_SERVICE_URL=http://localhost:3001
QUESTION_SERVICE_URL=http://localhost:8080
```

#### **AI Service** (`.env.example`)
```bash
# AI Provider Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...

# Service Configuration
APP_NAME=ai-service
DEBUG=false
HOST=0.0.0.0
PORT=8000

# Model Parameters
DEFAULT_MODEL=gemini-1.5-flash
MAX_TOKENS=4096
TEMPERATURE=0.7
```

### Secret Management

**Current Implementation**:
- **GitHub Secrets**: `GCP_SA_KEY` for Google Cloud authentication
- **Environment Variables**: API keys and connection strings passed at runtime
- **Docker Secrets**: Not implemented (using env vars in docker-compose)

**Justification**: GitHub Secrets provides encrypted storage and audit logs. Environment variables allow runtime configuration without rebuilding images.

**Production Recommendations**:
- Migrate to **Google Secret Manager** for GCP-hosted services
- Use **Kubernetes Secrets** if migrating to K8s
- Implement secret rotation policies
- Never commit secrets to Git (`.env.sample` files only)

### Configuration Hierarchy

1. **Default values** in code (fallback)
2. **Environment variables** (runtime override)
3. **Secret management system** (production)

Example from `matching-service/internal/config/config.go`:
```go
Port: getEnv("PORT", "8080")  // Default 8080 if PORT not set
RedisURL: getEnv("REDIS_URL", "localhost:6379")
```

---

## 3. Networking & Ingress

### Service-to-Service Communication

**Architecture**: HTTP REST APIs with service discovery via environment variables

**Communication Pattern**:
```
Frontend (Vercel)
    ↓ HTTPS
API Gateway (Not yet implemented)
    ↓
┌─────────────┬───────────────┬──────────────┐
│ User        │ Matching      │ Question     │
│ Service     │ Service       │ Service      │
│ (Port 3001) │ (Port 8080)   │ (Port 8080)  │
└─────┬───────┴───────┬───────┴──────┬───────┘
      │               │              │
      └───────────────┼──────────────┘
                      ↓
              ┌───────────────┐
              │ Collab Service│
              │ (Port 4000)   │
              │ WebSocket /ws │
              └───────────────┘
```

**Service Discovery**: Environment variable-based URLs
- Matching Service → User Service: `USER_SERVICE_URL` env var
- Matching Service → Question Service: `QUESTION_SERVICE_URL` env var

**Justification**: Simple and effective for small-scale deployments. For production, recommend service mesh (Istio) or Kubernetes DNS-based discovery.

### CORS Configuration

All backend services implement permissive CORS for development:

**Matching Service** (Go/Gin):
```go
AllowOrigins: ["*"]  // Development setting
AllowMethods: GET, POST, PUT, PATCH, DELETE, OPTIONS
AllowCredentials: true
MaxAge: 12 hours
```

**Production Recommendation**: Restrict `AllowOrigins` to specific frontend domains:
```go
AllowOrigins: ["https://peerprep.vercel.app"]
```

### WebSocket Configuration

**Collab Service** (Phoenix Framework):
- **Endpoint**: `/ws` via `UserSocket`
- **Channels**:
  - `session:*` → Collaborative coding sessions
  - `chat:*` → Real-time chat
- **CORS**: `check_origin: false` (development only)

**Production Recommendation**: Enable origin checking:
```elixir
check_origin: ["https://peerprep.vercel.app"]
```

### Port Mappings & Exposure

| Service | Internal Port | External Port | Cloud Run URL |
|---------|--------------|---------------|---------------|
| User Service | 3001 | 3001 | ✅ Deployed (asia-east1) |
| Matching Service | 8080 | 8080 | ✅ Deployed (asia-east1) |
| Question Service | 8080 | 8080 | ❌ Local only |
| Collab Service | 4000 | - | ❌ Not deployed |
| AI Service | 8000 | - | ❌ Not deployed |

### Ingress Strategy

**Current**: Direct Cloud Run URLs (no ingress controller)

**Missing**:
- API Gateway (e.g., Google Cloud API Gateway, Kong, Traefik)
- Ingress controller for path-based routing
- Rate limiting at gateway level
- SSL/TLS termination at ingress

**Recommended Production Architecture**:
```
Internet → Cloud Load Balancer → API Gateway
    ↓
Path-based routing:
  /api/users/* → User Service
  /api/match/* → Matching Service
  /api/questions/* → Question Service
  /ws/* → Collab Service (WebSocket)
```

---

## 4. CI/CD Pipeline & Rollout Strategy

### Pipeline Architecture

All pipelines follow GitHub Actions workflow with path-based triggers:

#### **User Service Pipeline** (`.github/workflows/user-service.yml`)

**Trigger**: `push` or `pull_request` to `master` with changes in `backend/user-service/**`

**Stages**:

1. **Build Stage**
   ```yaml
   - Setup Node.js 20
   - npm ci (install dependencies)
   - npm run lint (continue-on-error)
   - npm test (continue-on-error)
   - npm run build (continue-on-error)
   ```

2. **Deploy Stage** (only on push to master)
   ```yaml
   - Authenticate with GCP (GCP_SA_KEY secret)
   - Build Docker image: gcr.io/{PROJECT_ID}/user-service:{SHA}
   - Push to Google Container Registry
   - Deploy to Cloud Run (asia-east1)
     - Port: 3001
     - Allow unauthenticated (public endpoint)
   ```

**Deployment Command**:
```bash
gcloud run deploy user-service \
  --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/user-service:${{ github.sha }} \
  --region asia-east1 \
  --port 3001 \
  --allow-unauthenticated
```

#### **Matching Service Pipeline** (`.github/workflows/matching-service.yml`)

**Stages**:

1. **Build Stage**
   ```yaml
   - Setup Go 1.24.5 with caching
   - go mod tidy
   - golangci-lint (continue-on-error)
   - go build -o bin/matching-service
   - go test -v ./...
   ```

2. **Deploy Stage**
   ```yaml
   - Build and push Docker image (Git SHA tag)
   - Deploy to Cloud Run (port 8080)
   ```

#### **Collab Service Pipeline** (`.github/workflows/collab-service.yml`)

**Status**: CI only (no CD)

**Stages**:
```yaml
- Setup Elixir 1.18.4 + OTP 28.0
- Cache dependencies (mix.lock hash)
- mix deps.get
- mix test
```

**Missing**: Deployment stage (manual deployment required)

#### **AI Service Pipeline** (`.github/workflows/ai-service.yml`)

**Status**: CI only (no CD)

**Stages**:
```yaml
- Setup uv 0.8.17
- uv sync (install dependencies)
- ruff check (linting, continue-on-error)
- Import test (verify app can be imported)
- Health endpoint test (TestClient)
```

**Missing**: Deployment stage

### Promotion Flow

**Current**: Single-stage deployment (master → production)

```
Developer push → master branch
    ↓
GitHub Actions CI/CD
    ↓
Build → Test → Push to GCR
    ↓
Deploy to Cloud Run (Production)
```

**Recommended Multi-Environment Flow**:
```
feature branch → dev environment (auto-deploy)
    ↓
Pull Request → staging environment (manual approval)
    ↓
Merge to master → production (with canary/blue-green)
```

### Rollout Strategy

**Current**: Direct deployment (no rollout strategy)

**Cloud Run Behavior**:
- Gradual traffic migration (Cloud Run default)
- New revision receives traffic once healthy
- Old revision remains until new revision is stable

**Recommended Strategies**:

1. **Canary Deployment** (for critical services):
   ```bash
   gcloud run deploy user-service \
     --image new-image \
     --no-traffic  # Deploy without traffic

   gcloud run services update-traffic user-service \
     --to-revisions new-revision=10  # 10% traffic

   # Monitor metrics, then:
   gcloud run services update-traffic user-service \
     --to-revisions new-revision=100  # Full rollout
   ```

2. **Blue-Green Deployment**:
   - Deploy new version as separate service
   - Switch traffic at load balancer level
   - Keep old version running for instant rollback

### Rollback Plan

**Current Rollback Procedure**:
```bash
# List revisions
gcloud run revisions list --service user-service

# Rollback to previous revision
gcloud run services update-traffic user-service \
  --to-revisions previous-revision=100
```

**Automatic Rollback**: Not configured (requires monitoring integration)

**Recommended**:
- Set up health check-based automatic rollbacks
- Define rollback triggers (error rate > 5%, latency > 2s)
- Keep last 3 revisions for quick rollback

---

## 5. Observability & Monitoring

### Health Check Implementation

#### **Matching Service** (`/health` endpoint)
```go
func healthCheck(c *gin.Context) {
    c.JSON(200, gin.H{"message": "Matching service is running"})
}
```

**Docker Health Check**:
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1
```

**Justification**: Docker-level health checks ensure container orchestrator can detect and restart unhealthy instances.

#### **AI Service** (`/health` endpoint)
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "AI Service is running"}
```

**Docker Health Check**:
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost:8000/health || exit 1
```

**CI Testing**: Health endpoint is tested in GitHub Actions using FastAPI TestClient.

#### **Collab Service** (`/health/` endpoint)
```elixir
get "/health/", HealthController, :index
```

**Phoenix Dashboard**: Built-in LiveDashboard at `/dev/dashboard` (development only) provides:
- Request metrics
- Process memory usage
- ETS/Mnesia stats
- Live code reloading

### Liveness vs Readiness Probes

**Current**: Only liveness checks implemented (Docker HEALTHCHECK)

**Missing**: Readiness probes (should return unhealthy if dependencies unavailable)

**Recommended Readiness Check**:
```go
func readinessCheck(c *gin.Context) {
    // Check Redis connection
    if err := redisClient.Ping(ctx).Err(); err != nil {
        c.JSON(503, gin.H{"status": "not ready", "error": "redis unavailable"})
        return
    }
    c.JSON(200, gin.H{"status": "ready"})
}
```

### Logging Strategy

**Current Implementation**:
- **Node.js Services**: Console logging (stdout/stderr)
- **Go Services**: Standard `log` package
- **Python Services**: Uvicorn access logs + custom app logs
- **Elixir Services**: Phoenix Logger with telemetry events

**Log Levels**: Default INFO level (configurable via DEBUG env var)

**Cloud Run Integration**:
- Logs automatically collected by Google Cloud Logging
- Structured logging via JSON format (not yet implemented)

**Recommended Improvements**:
1. **Structured Logging** (JSON format):
   ```json
   {
     "timestamp": "2025-01-15T10:30:00Z",
     "level": "INFO",
     "service": "matching-service",
     "message": "User matched",
     "userId": "user123",
     "matchId": "match-456"
   }
   ```

2. **Correlation IDs**: Pass request IDs across services for distributed tracing

3. **Log Aggregation**: Centralized logging with ELK Stack or Google Cloud Logging

### Metrics & Monitoring

**Current**: No custom metrics exposed

**Cloud Run Built-in Metrics**:
- Request count
- Request latency (p50, p95, p99)
- CPU/Memory utilization
- Container instance count

**Missing**:
- Business metrics (matches created, questions completed)
- Custom SLIs (Service Level Indicators)
- Prometheus/Grafana dashboards
- Alert policies

**Recommended Metrics**:

**Matching Service**:
- `matching_requests_total` (counter)
- `matches_created_total` (counter)
- `queue_wait_time_seconds` (histogram)
- `question_selection_duration_seconds` (histogram)

**User Service**:
- `user_registrations_total` (counter)
- `auth_attempts_total{status}` (counter with labels)
- `session_duration_seconds` (histogram)

### Telemetry Implementation

**Collab Service** (Phoenix):
```elixir
# Telemetry events automatically collected:
[:phoenix, :endpoint, :start]
[:phoenix, :endpoint, :stop]
[:phoenix, :router_dispatch, :start]
[:phoenix, :router_dispatch, :stop]
```

**Integration with Phoenix LiveDashboard** provides real-time observability.

**Recommended**: Export telemetry to external systems (Prometheus, Datadog)

### Dashboards & Alerts

**Current**: Google Cloud Console dashboards (default metrics only)

**Missing**:
- Custom dashboards for business KPIs
- SLO-based alerting (e.g., 99.9% uptime target)
- On-call rotation and incident management

**Recommended Alert Policies**:

1. **High Error Rate**:
   - Condition: Error rate > 5% for 5 minutes
   - Action: Page on-call engineer

2. **High Latency**:
   - Condition: P95 latency > 2 seconds
   - Action: Slack notification

3. **Service Down**:
   - Condition: Health check fails 3 consecutive times
   - Action: Auto-restart + alert

4. **Resource Exhaustion**:
   - Condition: Memory usage > 90%
   - Action: Scale up + investigate

---

## 6. Production Readiness Assessment

### ✅ **Implemented**
- Containerization (all services)
- Multi-stage builds (Go, Elixir)
- Non-root users (security)
- CI/CD pipelines (User, Matching services)
- Health checks (Matching, AI services)
- Cloud Run deployment (User, Matching services)
- Environment-based configuration
- Docker Compose for local development

### ⚠️ **Partially Implemented**
- Secret management (env vars, no rotation)
- Logging (basic, not structured)
- Monitoring (default metrics only)
- Testing (continue-on-error in CI)
- CORS (permissive in development)

### ❌ **Missing**
- **Security Scanning**: No Trivy/Snyk in CI
- **Resource Limits**: No CPU/memory constraints
- **API Gateway**: No centralized ingress
- **Service Mesh**: No Istio/Linkerd
- **Distributed Tracing**: No Jaeger/OpenTelemetry
- **Custom Metrics**: No Prometheus exporters
- **Auto-scaling**: No HPA/VPA configuration
- **Disaster Recovery**: No backup/restore procedures
- **Load Testing**: No performance benchmarks
- **Staging Environment**: Direct to production

---

## 7. Recommended Next Steps

### Short-term (1-2 sprints)
1. Add Docker image vulnerability scanning (Trivy) to CI
2. Implement structured JSON logging
3. Deploy remaining services (Collab, AI, Question) to Cloud Run
4. Add resource limits to all services
5. Restrict CORS to production frontend domain

### Medium-term (3-6 sprints)
1. Set up staging environment with auto-deploy
2. Implement canary deployments for critical services
3. Add Prometheus metrics exporters
4. Set up Grafana dashboards
5. Implement readiness probes
6. Add distributed tracing (OpenTelemetry)

### Long-term (6-12 months)
1. Migrate to Kubernetes (GKE) for better orchestration
2. Implement service mesh (Istio) for advanced traffic management
3. Set up multi-region deployment for high availability
4. Implement chaos engineering (fault injection testing)
5. Add comprehensive load testing suite
6. Set up automated compliance scanning (SOC 2, GDPR)

---

## Conclusion

The current implementation provides a **solid foundation** for a microservices architecture with:
- ✅ Production-grade containerization
- ✅ Automated CI/CD for core services
- ✅ Cloud-native deployment (Google Cloud Run)
- ✅ Basic observability (health checks)

**Scalability**: Cloud Run provides automatic scaling (0 to N instances) based on traffic, making the architecture ready for production workloads.

**Production Readiness Score**: **7/10**
- Strong containerization and deployment automation
- Needs improvement in monitoring, security scanning, and multi-environment workflows
