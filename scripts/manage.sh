#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

COMPOSE_FILE="docker-compose.yml"
FW_COMPOSE_FILE="firewall/protect.yml"
NGROK_DOMAIN="cute-noble-boar.ngrok-free.app"

# Container names
CONTAINER_REST="telco-rest-api"
CONTAINER_GQL="telco-graphql-api"
CONTAINER_GQL_SECURED="telco-graphql-api-secured"
CONTAINER_MONGO="telco-mongo"

# Compose service names
SERVICE_REST="rest-api"
SERVICE_GQL="graphql-api"
SERVICE_GQL_SECURED="graphql-api-secured"
SERVICE_MONGO="mongo"

# ─── Helpers ──────────────────────────────────────────────────────────────────

remove_container() {
  local name="$1"
  if [ "$(docker ps -q -f name=^${name}$)" ]; then
    echo "  Stopping ${name}..."
    docker stop "${name}"
  fi
  if [ "$(docker ps -aq -f name=^${name}$)" ]; then
    echo "  Removing ${name}..."
    docker rm "${name}"
  fi
}

usage() {
  echo ""
  echo "Usage: $(basename "$0") <target> <command>"
  echo ""
  echo "  Targets:   rest | graphql | all"
  echo "  Commands:  start | stop | reset | data-reset | ngrok | fw-reset"
  echo ""
  echo "  Notes:"
  echo "    - fw-reset   : REST target only (API Firewall container)"
  echo "    - ngrok      : REST (port 3000) or GraphQL (port 4000) — not 'all'"
  echo "    - data-reset : target is ignored; always resets shared MongoDB"
  echo ""
  echo "  Examples:"
  echo "    $(basename "$0") all start"
  echo "    $(basename "$0") rest reset"
  echo "    $(basename "$0") graphql stop"
  echo "    $(basename "$0") rest ngrok"
  echo "    $(basename "$0") graphql ngrok"
  echo "    $(basename "$0") all data-reset"
  echo "    $(basename "$0") rest fw-reset"
  echo ""
  exit 1
}

# ─── Commands ─────────────────────────────────────────────────────────────────

cmd_start() {
  local target="$1"
  echo "==> Starting ${target}..."
  case "$target" in
    rest)    docker compose -f "$COMPOSE_FILE" up -d "$SERVICE_REST" ;;
    graphql) docker compose -f "$COMPOSE_FILE" up -d "$SERVICE_GQL" "$SERVICE_GQL_SECURED" ;;
    all)     docker compose -f "$COMPOSE_FILE" up -d ;;
  esac
}

cmd_stop() {
  local target="$1"
  echo "==> Stopping ${target}..."
  case "$target" in
    rest)    docker compose -f "$COMPOSE_FILE" stop "$SERVICE_REST" ;;
    graphql) docker compose -f "$COMPOSE_FILE" stop "$SERVICE_GQL" "$SERVICE_GQL_SECURED" ;;
    all)     docker compose -f "$COMPOSE_FILE" stop ;;
  esac
}

cmd_reset() {
  local target="$1"
  echo "==> Resetting ${target} containers..."
  case "$target" in
    rest)
      remove_container "$CONTAINER_REST"
      docker compose -f "$COMPOSE_FILE" up -d "$SERVICE_REST"
      ;;
    graphql)
      remove_container "$CONTAINER_GQL"
      remove_container "$CONTAINER_GQL_SECURED"
      docker compose -f "$COMPOSE_FILE" up -d "$SERVICE_GQL" "$SERVICE_GQL_SECURED"
      ;;
    all)
      remove_container "$CONTAINER_REST"
      remove_container "$CONTAINER_GQL"
      remove_container "$CONTAINER_GQL_SECURED"
      docker compose -f "$COMPOSE_FILE" up -d "$SERVICE_REST" "$SERVICE_GQL" "$SERVICE_GQL_SECURED"
      ;;
  esac
}

cmd_data_reset() {
  echo "==> Resetting MongoDB (data preserved in volume)..."
  remove_container "$CONTAINER_MONGO"
  docker compose -f "$COMPOSE_FILE" up -d "$SERVICE_MONGO"
  echo ""
  echo "==> Container status:"
  docker compose -f "$COMPOSE_FILE" ps
}

cmd_fw_reset() {
  local target="$1"
  if [ "$target" != "rest" ]; then
    echo "Error: fw-reset is only supported for target 'rest'"
    exit 1
  fi
  echo "==> Resetting API Firewall..."
  remove_container "telco-api-firewall"
  docker compose -p telco-vulnerable-api -f "$FW_COMPOSE_FILE" up -d telco-secured.42crunch.test
}

cmd_ngrok() {
  local target="$1"
  case "$target" in
    rest)
      echo "==> Starting ngrok tunnel → https://localhost:3000"
      ngrok http --url="$NGROK_DOMAIN" https://localhost:3000
      ;;
    graphql)
      echo "==> Starting ngrok tunnel → https://localhost:4000"
      ngrok http --url="$NGROK_DOMAIN" https://localhost:4000
      ;;
    all)
      echo "Error: ngrok requires a specific target (rest or graphql), not 'all'"
      exit 1
      ;;
  esac
}

# ─── Entry Point ──────────────────────────────────────────────────────────────

TARGET="${1:-}"
COMMAND="${2:-}"

if [ -z "$TARGET" ] || [ -z "$COMMAND" ]; then
  usage
fi

case "$TARGET" in
  rest|graphql|all) ;;
  *) echo "Error: Unknown target '${TARGET}'"; usage ;;
esac

case "$COMMAND" in
  start)      cmd_start "$TARGET" ;;
  stop)       cmd_stop "$TARGET" ;;
  reset)      cmd_reset "$TARGET" ;;
  data-reset) cmd_data_reset "$TARGET" ;;
  fw-reset)   cmd_fw_reset "$TARGET" ;;
  ngrok)      cmd_ngrok "$TARGET" ;;
  *) echo "Error: Unknown command '${COMMAND}'"; usage ;;
esac
