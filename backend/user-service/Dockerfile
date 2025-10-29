# 1) Use a small Node.js base image
FROM node:20-alpine AS base
WORKDIR /app

# 2) Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 3) Copy source code
COPY . .

# 4) Create non-root user and switch
RUN addgroup -S app && adduser -S app -G app
RUN chown -R app:app /app
USER app

# 5) Expose runtime port (default 3001; override with PORT env)
EXPOSE 3001

# 6) Start the service
ENV NODE_ENV=production
CMD [ "node", "server.js" ]

