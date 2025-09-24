#!/bin/bash

# SwiftSalon Database Restore Script
# Usage: ./restore-db.sh [backup_file]

set -e

# Configuration
DB_CONTAINER="swiftsalon-postgres"
DB_NAME="swiftsalon"
DB_USER="swiftsalon_user"
BACKUP_DIR="./database/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Show usage
usage() {
    echo "Usage: $0 [backup_file]"
    echo ""
    echo "If no backup file is specified, the latest backup will be used."
    echo ""
    echo "Available backups:"
    ls -la "$BACKUP_DIR"/swiftsalon_backup_*.sql.gz 2>/dev/null | tail -5 || echo "No backups found"
    exit 1
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running"
    exit 1
fi

# Check if container exists and is running
if ! docker-compose ps | grep -q "$DB_CONTAINER.*Up"; then
    error "Database container is not running"
    exit 1
fi

# Determine backup file to restore
if [ -z "$1" ]; then
    # Use latest backup
    BACKUP_FILE="$BACKUP_DIR/latest_backup.sql.gz"
    if [ ! -f "$BACKUP_FILE" ]; then
        error "No latest backup found. Please specify a backup file."
        usage
    fi
    log "Using latest backup: $BACKUP_FILE"
else
    BACKUP_FILE="$1"
    if [ ! -f "$BACKUP_FILE" ]; then
        error "Backup file not found: $BACKUP_FILE"
        usage
    fi
    log "Using specified backup: $BACKUP_FILE"
fi

# Confirm restore operation
warning "This will overwrite all data in the database!"
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    log "Restore operation cancelled"
    exit 0
fi

log "Starting database restore..."

# Stop the application to prevent connections
log "Stopping application container..."
docker-compose stop swiftsalon

# Wait a moment for connections to close
sleep 5

# Terminate existing connections
log "Terminating existing database connections..."
docker-compose exec -T postgres psql -U "$DB_USER" -d postgres -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
"

# Drop and recreate database
log "Recreating database..."
docker-compose exec -T postgres psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
docker-compose exec -T postgres psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"

# Restore from backup
log "Restoring database from backup..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
    # Compressed backup
    gunzip -c "$BACKUP_FILE" | docker-compose exec -T postgres pg_restore \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --verbose \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges
else
    # Uncompressed backup
    docker-compose exec -T postgres pg_restore \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --verbose \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        < "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
    log "Database restore completed successfully"
else
    error "Database restore failed"
    exit 1
fi

# Restart the application
log "Starting application container..."
docker-compose start swiftsalon

# Wait for application to be ready
log "Waiting for application to start..."
sleep 10

# Verify restore
log "Verifying database restore..."
TABLE_COUNT=$(docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
")

log "Database restore verification:"
echo "  Tables restored: $TABLE_COUNT"
echo "  Backup file: $BACKUP_FILE"
echo "  Restore date: $(date)"

# Check application health
if docker-compose exec swiftsalon curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    log "Application is running and healthy"
else
    warning "Application may not be fully ready yet. Check logs with: docker-compose logs swiftsalon"
fi

log "Database restore process completed"