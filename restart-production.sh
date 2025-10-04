#!/bin/bash

# SwiftSalon Production Restart Script
# Run this script after Proxmox/LXC restart to bring all services back online

set -e

echo "🔄 SwiftSalon Production Restart Starting..."

# Configuration
PROJECT_DIR="/opt/swiftsalon-poc"
LOG_FILE="/var/log/swiftsalon-restart.log"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log "=== SwiftSalon Service Restart ==="

# Check if running in correct directory
if [ ! -d "$PROJECT_DIR" ]; then
    log "❌ Project directory not found: $PROJECT_DIR"
    log "Creating project directory..."
    mkdir -p $PROJECT_DIR
fi

cd $PROJECT_DIR

# Step 1: Check Docker service
log "Step 1: Checking Docker service..."
if ! systemctl is-active --quiet docker; then
    log "Starting Docker service..."
    systemctl start docker
    sleep 5
fi

if systemctl is-active --quiet docker; then
    log "✅ Docker service is running"
else
    log "❌ Docker service failed to start"
    exit 1
fi

# Step 2: Stop any existing containers (clean state)
log "Step 2: Stopping existing containers..."
if [ -f "docker-compose.yml" ]; then
    docker-compose down 2>/dev/null || true
    log "✅ Existing containers stopped"
else
    log "⚠️  docker-compose.yml not found"
fi

# Step 3: Start PostgreSQL database
log "Step 3: Starting PostgreSQL database..."
docker-compose up -d postgres

log "Waiting for PostgreSQL to be ready..."
sleep 10

# Check if PostgreSQL is running
if docker-compose ps postgres | grep -q "Up"; then
    log "✅ PostgreSQL database is running"
else
    log "❌ PostgreSQL failed to start"
    docker-compose logs postgres
    exit 1
fi

# Step 4: Start Next.js application
log "Step 4: Starting SwiftSalon application..."
docker-compose up -d app

log "Waiting for application to be ready..."
sleep 15

# Check if app is running
if docker-compose ps app | grep -q "Up"; then
    log "✅ SwiftSalon application is running"
else
    log "❌ Application failed to start"
    docker-compose logs app
    exit 1
fi

# Step 5: Verify database connection
log "Step 5: Verifying database connection..."
docker-compose exec -T app npx prisma db pull 2>/dev/null && log "✅ Database connection verified" || log "⚠️  Database connection check failed"

# Step 6: Health check
log "Step 6: Running health checks..."
sleep 5

# Get container IP
APP_IP=$(hostname -I | awk '{print $1}')

log "=== Service Status ==="
docker-compose ps

log ""
log "=== Deployment Information ==="
log "Project Directory: $PROJECT_DIR"
log "Application URL: http://$APP_IP:3000"
log "Production URL: https://demo.atokcloud.com"
log ""

# Test application endpoint
log "Testing application endpoint..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    log "✅ Application is responding to requests"
else
    log "⚠️  Application health check returned unexpected status"
    log "This may be normal during startup - check logs if issues persist"
fi

log ""
log "=== Quick Commands ==="
log "View all logs:        docker-compose logs -f"
log "View app logs:        docker-compose logs -f app"
log "View DB logs:         docker-compose logs -f postgres"
log "Restart app:          docker-compose restart app"
log "Restart all:          docker-compose restart"
log "Stop all:             docker-compose down"
log "Check status:         docker-compose ps"
log ""

log "🎉 SwiftSalon Production Restart Complete!"
log ""
log "✅ All services should now be running"
log "⚠️  If you see any errors above, check the logs with: docker-compose logs"
log ""
log "Next steps:"
log "1. Verify the application at: http://$APP_IP:3000"
log "2. Check admin panel: https://demo.atokcloud.com/admin"
log "3. Monitor logs for any errors: docker-compose logs -f"
