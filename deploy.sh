#!/bin/bash
set -e

# Project name for Docker Compose
export COMPOSE_PROJECT_NAME=flow-crm-ai

echo "=========================================================="
echo "🚀 Starting FlowCRM AI Deployment"
echo "=========================================================="

# 1. Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  .env file not found in root! Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please review and update the .env file with production values."
fi

# Load environment variables to read host ports
echo "⚙️  Loading environment variables from .env..."
set -a
[ -f .env ] && . .env
set +a

# Set fallback default ports if they aren't in the .env
WEB_HOST_PORT=${WEB_HOST_PORT:-7080}
API_HOST_PORT=${API_HOST_PORT:-5003}
DB_HOST_PORT=${DB_HOST_PORT:-45432}

# 2. Find Docker Compose command
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "❌ Error: Docker Compose is not installed on this system!"
    exit 1
fi

echo "🐳 Using Docker Compose command: $DOCKER_COMPOSE"

# 3. Check target ports if occupied (without force-killing)
echo "🔍 Checking if target ports ($WEB_HOST_PORT, $API_HOST_PORT, $DB_HOST_PORT) are already in use..."
PORT_CONFLICT=false

for PORT in "$WEB_HOST_PORT" "$API_HOST_PORT" "$DB_HOST_PORT"; do
    # Check for Docker containers occupying this port
    CONFLICTING_CONTAINERS=$(docker ps --filter "publish=$PORT" -q)
    if [ -n "$CONFLICTING_CONTAINERS" ]; then
        for CID in $CONFLICTING_CONTAINERS; do
            C_PROJECT=$(docker inspect --format '{{index .Config.Labels "com.docker.compose.project"}}' "$CID" 2>/dev/null || echo "")
            if [ "$C_PROJECT" = "$COMPOSE_PROJECT_NAME" ]; then
                echo "ℹ️  Port $PORT is used by container $CID which belongs to our project ($COMPOSE_PROJECT_NAME). Docker Compose will handle updating it."
            else
                C_NAME=$(docker inspect --format '{{.Name}}' "$CID" 2>/dev/null | sed 's/\///')
                echo "❌ Conflict: Port $PORT is occupied by container '$C_NAME' ($CID) from project '$C_PROJECT'!"
                PORT_CONFLICT=true
            fi
        done
    fi

    # Check for host processes occupying this port
    if command -v fuser &> /dev/null; then
        if fuser "$PORT/tcp" &>/dev/null; then
            echo "❌ Conflict: Port $PORT/tcp is occupied by a host process!"
            PORT_CONFLICT=true
        fi
    elif command -v lsof &> /dev/null; then
        PID=$(lsof -t -i:"$PORT" 2>/dev/null || true)
        if [ -n "$PID" ]; then
            echo "❌ Conflict: Port $PORT is occupied by host process PID $PID!"
            PORT_CONFLICT=true
        fi
    fi
done

if [ "$PORT_CONFLICT" = true ]; then
    echo "❌ Error: Port conflicts detected! Please free the ports listed above, or change them in your .env file."
    exit 1
fi

# 4. Build and start services
echo "🏗️  Building and starting FlowCRM AI containers..."
$DOCKER_COMPOSE up -d --build --remove-orphans

# 5. Verify Running Setup
echo "📊 Current Container Status:"
$DOCKER_COMPOSE ps

# 6. Clean up unused images to free up disk space on the VPS
echo "🧹 Cleaning up dangling Docker images..."
docker image prune -f

echo "=========================================================="
echo "🎉 FlowCRM AI Deployment Completed Successfully!"
echo "📍 Access Web UI on http://<vps-ip>:$WEB_HOST_PORT"
echo "=========================================================="
