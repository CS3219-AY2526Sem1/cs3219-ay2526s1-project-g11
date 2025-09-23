# Builder stage
FROM golang:1.24.5-alpine AS builder

WORKDIR /src

# Install build tools and certs
RUN apk add --no-cache git ca-certificates && update-ca-certificates

# Cache dependencies first
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source
COPY . .

# Build static binary for Linux
ENV CGO_ENABLED=0
ARG TARGETOS=linux
ARG TARGETARCH=amd64
RUN GOOS=${TARGETOS} GOARCH=${TARGETARCH} \
    go build -trimpath -ldflags "-s -w" -o /out/matching-service ./cmd/web

# Runtime stage
FROM gcr.io/distroless/static-debian12

# Run as non-root for security
USER nonroot:nonroot

# Copy binary
COPY --from=builder /out/matching-service /app/matching-service

EXPOSE 8080

ENTRYPOINT ["/app/matching-service"]
