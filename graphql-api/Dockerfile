# Build context must be the repo root:
#   docker build -f graphql-api/Dockerfile .
# (handled automatically by docker-compose.yml)

FROM node:20-alpine

WORKDIR /app

# Install shared dependencies first (better layer caching)
COPY shared/package.json ./shared/package.json
RUN cd shared && npm install --omit=dev

# Install GraphQL API dependencies
COPY graphql-api/package.json ./graphql-api/package.json
RUN cd graphql-api && npm install --omit=dev

# Copy source (after deps to maximise cache hits)
COPY shared/ ./shared/
COPY graphql-api/ ./graphql-api/

# server.js reads certs from process.env.CERT_PATH || "../shared/certs"
# With WORKDIR /app/graphql-api that resolves to /app/shared/certs — no code changes needed.
WORKDIR /app/graphql-api

# Expose both servers: vulnerable (4000) and secured (4001)
EXPOSE 4000 4001

# Default: start vulnerable server. Override with command: ["node", "server-secured.js"]
CMD ["node", "server.js"]
