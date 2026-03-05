# Build context must be the repo root:
#   docker build -f rest-api/Dockerfile .
# (handled automatically by docker-compose.yml)

FROM node:20-alpine

WORKDIR /app

# Install shared dependencies first (better layer caching)
COPY shared/package.json ./shared/package.json
RUN cd shared && npm install --omit=dev

# Install REST API dependencies
COPY rest-api/package.json ./rest-api/package.json
RUN cd rest-api && npm install --omit=dev

# Copy source (after deps to maximise cache hits)
COPY shared/ ./shared/
COPY rest-api/ ./rest-api/

# app.js reads certs from ../shared/certs relative to rest-api/
# With WORKDIR /app/rest-api that resolves to /app/shared/certs — no code changes needed.
WORKDIR /app/rest-api

EXPOSE 3000

CMD ["node", "app.js"]
