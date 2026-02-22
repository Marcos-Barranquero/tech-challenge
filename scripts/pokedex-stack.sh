#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$ROOT_DIR/.run"
OLLAMA_PID_FILE="$PID_DIR/ollama.pid"
ENV_FILE="$ROOT_DIR/.env"

read_env_value() {
  local key="$1"
  local value

  if [[ -f "$ENV_FILE" ]]; then
    value="$(awk -F= -v k="$key" '
      $0 ~ "^[[:space:]]*"k"=" {
        sub(/^[[:space:]]*[^=]+=[[:space:]]*/, "", $0)
        gsub(/^[\"'"'"']|[\"'"'"']$/, "", $0)
        print $0
        exit
      }
    ' "$ENV_FILE")"
  fi

  echo "${value:-}"
}

AI_MODE="groq"
MODEL="${OLLAMA_MODEL:-$(read_env_value OLLAMA_MODEL)}"
MODEL="${MODEL:-qwen2:0.5b}"
MODEL_OVERRIDDEN=0
ACTION="${1:-}"
SERVICE="${2:-}"
GROQ_MODEL_VALUE="${GROQ_MODEL:-$(read_env_value GROQ_MODEL)}"
GROQ_MODEL_VALUE="${GROQ_MODEL_VALUE:-llama-3.1-8b-instant}"
GROQ_API_KEY_VALUE="${GROQ_API_KEY:-$(read_env_value GROQ_API_KEY)}"
OLLAMA_FLASH_ATTENTION_VALUE="${OLLAMA_FLASH_ATTENTION:-1}"
OLLAMA_KV_CACHE_TYPE_VALUE="${OLLAMA_KV_CACHE_TYPE:-q8_0}"
OLLAMA_LLM_LIBRARY_VALUE="${OLLAMA_LLM_LIBRARY:-metal}"
OLLAMA_KEEP_ALIVE_VALUE="${OLLAMA_KEEP_ALIVE:-24h}"
OLLAMA_NUM_PARALLEL_VALUE="${OLLAMA_NUM_PARALLEL:-2}"

print_help() {
  cat <<'EOF'
Usage:
  ./scripts/pokedex-stack.sh up [--ai ollama|host|groq|none] [--model MODEL]
  ./scripts/pokedex-stack.sh down [--ai ollama|host|groq|none]
  ./scripts/pokedex-stack.sh status
  ./scripts/pokedex-stack.sh logs [service]

Examples:
  ./scripts/pokedex-stack.sh up --ai ollama --model phi3:mini   # Ollama model
  ./scripts/pokedex-stack.sh up --ai groq --model llama-3.3-70b-versatile  # Groq model override
  ./scripts/pokedex-stack.sh down --ai ollama
  ./scripts/pokedex-stack.sh logs api
EOF
}

parse_flags() {
  if [[ $# -gt 0 ]]; then
    shift
  fi
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --ai)
        AI_MODE="${2:-}"
        shift 2
        ;;
      --model)
        MODEL="${2:-}"
        MODEL_OVERRIDDEN=1
        shift 2
        ;;
      --help|-h)
        print_help
        exit 0
        ;;
      *)
        echo "Unknown option: $1"
        print_help
        exit 1
        ;;
    esac
  done
}

ensure_compose() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is required."
    exit 1
  fi
}

ensure_ollama_running_host() {
  if ! command -v ollama >/dev/null 2>&1; then
    echo "Ollama CLI not found in PATH. Install Ollama or run with --ai none."
    exit 1
  fi

  mkdir -p "$PID_DIR"
  if curl -fsS "http://127.0.0.1:11434/api/tags" >/dev/null 2>&1; then
    echo "Ollama host is already running."
  else
    echo "Starting Ollama host service..."
    nohup env \
      OLLAMA_FLASH_ATTENTION="$OLLAMA_FLASH_ATTENTION_VALUE" \
      OLLAMA_KV_CACHE_TYPE="$OLLAMA_KV_CACHE_TYPE_VALUE" \
      OLLAMA_LLM_LIBRARY="$OLLAMA_LLM_LIBRARY_VALUE" \
      OLLAMA_KEEP_ALIVE="$OLLAMA_KEEP_ALIVE_VALUE" \
      OLLAMA_NUM_PARALLEL="$OLLAMA_NUM_PARALLEL_VALUE" \
      ollama serve >/tmp/pokedex-ollama.log 2>&1 &
    echo $! > "$OLLAMA_PID_FILE"
    sleep 2
  fi

  echo "Pulling model $MODEL on host..."
  ollama pull "$MODEL"
}

stop_ollama_host_if_managed() {
  if [[ -f "$OLLAMA_PID_FILE" ]]; then
    local pid
    pid="$(cat "$OLLAMA_PID_FILE")"
    if kill -0 "$pid" >/dev/null 2>&1; then
      echo "Stopping managed Ollama process ($pid)..."
      kill "$pid" || true
    fi
    rm -f "$OLLAMA_PID_FILE"
  fi
}

up_stack() {
  ensure_compose
  cd "$ROOT_DIR"

  case "$AI_MODE" in
    host|ollama)
      ensure_ollama_running_host
      echo "Starting stack with Ollama on host (Metal acceleration on Apple Silicon)..."
      COMPOSE_PROFILES=ollama \
      OLLAMA_URL="http://host.docker.internal:11434" \
      OLLAMA_MODEL="$MODEL" \
      AI_PROVIDER=ollama \
      docker compose --profile ollama up -d --build
      ;;
    groq)
      if [[ -z "$GROQ_API_KEY_VALUE" ]]; then
        echo "GROQ_API_KEY is required for --ai groq."
        echo "Set it in your shell or in .env and retry."
        exit 1
      fi
      if [[ "$MODEL_OVERRIDDEN" -eq 1 ]]; then
        GROQ_MODEL_VALUE="$MODEL"
      fi
      echo "Starting stack with Groq API..."
      COMPOSE_PROFILES=groq \
      AI_PROVIDER=groq \
      GROQ_MODEL="$GROQ_MODEL_VALUE" \
      GROQ_API_KEY="$GROQ_API_KEY_VALUE" \
      docker compose --profile groq up -d --build
      ;;
    none)
      echo "Starting stack with AI disabled..."
      COMPOSE_PROFILES=none AI_PROVIDER=none docker compose --profile none up -d --build
      ;;
    *)
      echo "Invalid --ai mode: $AI_MODE"
      exit 1
      ;;
  esac

  echo "Web: http://localhost:3000"
  echo "API: http://localhost:4000/health"
}

down_stack() {
  ensure_compose
  cd "$ROOT_DIR"
  docker compose --profile none --profile ollama --profile groq down --remove-orphans
  if [[ "$AI_MODE" == "host" || "$AI_MODE" == "ollama" ]]; then
    stop_ollama_host_if_managed
  fi
}

status_stack() {
  ensure_compose
  cd "$ROOT_DIR"
  docker compose --profile none --profile ollama --profile groq ps
}

logs_stack() {
  ensure_compose
  cd "$ROOT_DIR"
  if [[ -n "$SERVICE" ]]; then
    docker compose --profile none --profile ollama --profile groq logs -f "$SERVICE"
  else
    docker compose --profile none --profile ollama --profile groq logs -f
  fi
}

case "$ACTION" in
  up)
    parse_flags "$@"
    up_stack
    ;;
  down)
    parse_flags "$@"
    down_stack
    ;;
  status)
    status_stack
    ;;
  logs)
    logs_stack
    ;;
  --help|-h|"")
    print_help
    ;;
  *)
    echo "Unknown action: $ACTION"
    print_help
    exit 1
    ;;
esac
